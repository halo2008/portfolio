import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GenerateChatResponseUseCase } from '../../application/generate-chat-response.use-case';
import { ChatGatewayPort } from '../../domain/ports/chat-gateway.port';
import { FirestorePersistenceAdapter } from '../adapters/firestore-persistence.adapter';
import { Server } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, ChatGatewayPort {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly generateChatResponse: GenerateChatResponseUseCase,
    private readonly persistence: FirestorePersistenceAdapter,
  ) { }

  sendMessageToClient(socketId: string, payload: { sender: string; message: string }): void {
    this.server.to(socketId).emit('messageToClient', payload);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(
    @MessageBody() payload: { text: string; sessionId?: string; captcha?: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
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

      // Explaining: Executing the hexagonal Use Case.
      const stream = this.generateChatResponse.execute(payload.text, sessionId);

      for await (const chunk of stream) {
        client.emit('messageToClient', { sender: 'AI', message: chunk, isChunk: true });
      }

      client.emit('streamComplete', { sender: 'AI' });
    } catch (error) {
      this.logger.error(`Chat error for socket ${client.id}:`, error.message);
      this.logger.error(`Full stack:`, error.stack);
      this.logger.error(`Payload received: text="${payload.text?.substring(0, 50)}", sessionId=${payload.sessionId}, captcha=${!!payload.captcha}`);
      client.emit('messageToClient', { sender: 'System', message: 'Error processing your request.' });
    }
  }
}
