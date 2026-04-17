import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ChatWithAdminKnowledgeUseCase } from '../../application/use-cases/chat-with-admin-knowledge.use-case';
import { ChatGatewayPort } from '../../domain/ports/chat-gateway.port';
import { FirestorePersistenceAdapter } from '../adapters/firestore-persistence.adapter';
import { SlackNotificationAdapter } from '../adapters/slack-notification.adapter';
import { TELEMETRY_PORT, TelemetryPort } from '../../domain/ports/telemetry.port';
import { RagSecurityContext } from '../../../lab/infrastructure/security/security.interceptor';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, ChatGatewayPort {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly inactivityTimeouts = new Map<string, NodeJS.Timeout>();
  // Aggressive 30-second timeout to save costs since this is just a CV demo
  private readonly IDLE_TIMEOUT_MS = 30 * 1000; // 30 seconds

  constructor(
    @Inject(ChatWithAdminKnowledgeUseCase)
    private readonly chatWithAdminKnowledge: ChatWithAdminKnowledgeUseCase,
    private readonly persistence: FirestorePersistenceAdapter,
    private readonly notifier: SlackNotificationAdapter,
    @Inject(TELEMETRY_PORT) private readonly telemetry: TelemetryPort,
  ) { }

  sendMessageToClient(socketId: string, payload: { sender: string; message: string }): void {
    this.server.to(socketId).emit('messageToClient', payload);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.telemetry.incrementActiveWebSockets();
    this.resetInactivityTimeout(client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const timeout = this.inactivityTimeouts.get(client.id);
    if (timeout) {
      clearTimeout(timeout);
      this.inactivityTimeouts.delete(client.id);
    }
    this.telemetry.decrementActiveWebSockets();
  }

  private resetInactivityTimeout(client: Socket) {
    const existing = this.inactivityTimeouts.get(client.id);
    if (existing) {
      clearTimeout(existing);
    }

    const timeout = setTimeout(() => {
      this.logger.log(`Disconnecting idle client: ${client.id}`);
      client.emit('messageToClient', {
        sender: 'System',
        message: 'Disconnected due to inactivity. Please refresh the page to reconnect.',
      });
      client.disconnect(true);
    }, this.IDLE_TIMEOUT_MS);

    this.inactivityTimeouts.set(client.id, timeout);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @MessageBody() payload: { text: string; sessionId?: string; captcha?: string; language?: 'pl' | 'en' },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    this.resetInactivityTimeout(client);
    try {
      const sessionId = payload.sessionId || client.id;
      const token = payload.captcha;

      if (!token && process.env.NODE_ENV === 'production') {
        this.logger.warn(`Captcha missing for socket ${client.id}`);
        client.emit('messageToClient', { sender: 'System', message: 'Missing CAPTCHA verification.' });
        return;
      }

      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (token && secretKey) {
        const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, { method: 'POST' });
        const data = await verifyRes.json();

        if (!data.success || data.score < 0.5) {
          this.logger.warn(`Bot detected for socket ${client.id}. Score: ${data.score}`);
          client.emit('messageToClient', { sender: 'System', message: 'Suspicious activity detected.' });
          return;
        }
      }

      // Human-in-the-loop: check if human mode is active
      const isHumanMode = await this.persistence.isHumanMode(sessionId);
      if (isHumanMode) {
        client.emit('messageToClient', { sender: 'AI', message: '[Konrad has taken over the conversation. AI is paused.]', isChunk: false });
        client.emit('streamComplete', { sender: 'AI' });
        return;
      }

      // Slack notifications
      let slackThread = await this.persistence.getThreadBySocketId(sessionId);
      this.logger.log(`Using Slack thread: ${slackThread || 'NEW'} for session: ${sessionId}`);

      if (slackThread) {
        try {
          await this.notifier.logUserMessage(slackThread, payload.text);
        } catch (err) {
          this.logger.warn(`Slack logging failed for user message: ${(err as Error).message}`);
        }
      } else {
        try {
          slackThread = await this.notifier.logConversationStart(payload.text, sessionId);
          if (slackThread) {
            await this.persistence.linkThread(slackThread, sessionId);
          }
        } catch (err) {
          this.logger.warn(`Slack start conversation logging failed: ${(err as Error).message}`);
        }
      }

      // Save user message to history
      try {
        await this.persistence.saveMessage(sessionId, 'user', payload.text);
      } catch (err) {
        this.logger.warn(`Save user message failed: ${(err as Error).message}`);
      }

      const context: RagSecurityContext = {
        userId: 'system_main_page',
        role: 'admin',
        language: payload.language || this.detectLanguage(payload.text),
      };

      const result = await this.chatWithAdminKnowledge.execute(
        { message: payload.text, sessionId },
        context,
      );

      this.telemetry.observeVectorSearchLatency(result.timings.searchMs);
      this.telemetry.observeLlmLatency(result.timings.llmMs);
      this.telemetry.incrementLlmRequests();

      // Send response as a single chunk (admin knowledge is not streaming)
      client.emit('messageToClient', { sender: 'AI', message: result.response, isChunk: true });
      client.emit('streamComplete', { sender: 'AI' });

      // Save AI response to history
      try {
        await this.persistence.saveMessage(sessionId, 'model', result.response);
      } catch (err) {
        this.logger.warn(`Save model message failed: ${(err as Error).message}`);
      }

      // Log AI response to Slack
      try {
        if (slackThread) {
          await this.notifier.logAiResponse(slackThread, result.response);
        }
      } catch (err) {
        this.logger.warn(`Slack AI response logging failed: ${(err as Error).message}`);
      }
    } catch (error) {
      this.logger.error(`Chat error for socket ${client.id}:`, (error as Error).message);
      this.logger.error(`Full stack:`, (error as Error).stack);
      this.logger.error(`Payload received: text="${payload.text?.substring(0, 50)}", sessionId=${payload.sessionId}, captcha=${!!payload.captcha}`);
      client.emit('messageToClient', { sender: 'System', message: 'Error processing your request.' });
    }
  }

  private detectLanguage(message: string): 'pl' | 'en' {
    const lower = message.toLowerCase();
    if (/[ąćęłńóśźż]/.test(lower) || /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|nie|tak)\b/.test(lower)) {
      return 'pl';
    }
    return 'en';
  }
}
