import { ChatProviderPort } from '../domain/ports/chat-provider.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { VectorDbPort } from '../domain/ports/vector-db.port';
import { NotificationPort } from '../domain/ports/notification.port';
import { TelemetryPort } from '../domain/ports/telemetry.port';
import { KONRAD_SYSTEM_PROMPT } from '../domain/chat.constants';
import { Logger } from '@nestjs/common';

export class GenerateChatResponseUseCase {
  private readonly logger = new Logger(GenerateChatResponseUseCase.name);

  constructor(
    private readonly ai: ChatProviderPort,
    private readonly repository: PersistencePort,
    private readonly vectorDb: VectorDbPort,
    private readonly notifier: NotificationPort,
    private readonly telemetry: TelemetryPort,
  ) { }

  async *execute(message: string, sessionId: string, slackThread?: string | null): AsyncGenerator<string> {
    // CHECK: Is human mode active? If so, don't respond.
    const isHumanMode = await this.repository.isHumanMode(sessionId);
    if (isHumanMode) {
      yield "[Konrad has taken over the conversation. AI is paused.]";
      return;
    }

    if (slackThread) {
      try {
        await this.notifier.logUserMessage(slackThread, message);
      } catch (error) {
        this.logger.warn(`Slack logging failed for user message: ${(error as Error).message}`);
      }
    }

    let threadTs = slackThread;
    if (!threadTs) {
      try {
        threadTs = await this.notifier.logConversationStart(message, sessionId);
        if (threadTs) {
          await this.repository.linkThread(threadTs, sessionId);
        }
      } catch (error) {
        this.logger.warn(`Slack start conversation logging failed: ${(error as Error).message}`);
      }
    }

    let history = [];
    try {
      history = await this.repository.getHistory(sessionId, 6);
    } catch (error) {
      this.logger.warn(`History fetch failed: ${(error as Error).message}`);
    }

    const embedding = await this.ai.generateEmbedding(message);

    let context = '';
    const vectorSearchStart = performance.now();
    try {
      context = await this.vectorDb.search(embedding, 0.6);
    } catch (error) {
      this.logger.error(`Vector search failed: ${(error as Error).message}`, (error as Error).stack);
    }
    finally {
      this.telemetry.observeVectorSearchLatency(performance.now() - vectorSearchStart);
    }

    const systemPrompt = KONRAD_SYSTEM_PROMPT(context);

    try {
      await this.repository.saveMessage(sessionId, 'user', message);
    } catch (error) {
      this.logger.warn(`Save user message failed: ${(error as Error).message}`);
    }

    let fullResponse = "";
    const streamStart = performance.now();
    const stream = this.ai.generateResponseStream(message, systemPrompt, history);

    this.telemetry.incrementLlmRequests();

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }
    this.telemetry.observeLlmLatency(performance.now() - streamStart);

    try {
      await this.repository.saveMessage(sessionId, 'model', fullResponse);
    } catch (error) {
      this.logger.warn(`Save model message failed: ${(error as Error).message}`);
    }

    try {
      if (threadTs) {
        await this.notifier.logAiResponse(threadTs, fullResponse);
      }
    } catch (error) {
      this.logger.warn(`Slack AI response logging failed: ${(error as Error).message}`);
    }
  }
}
