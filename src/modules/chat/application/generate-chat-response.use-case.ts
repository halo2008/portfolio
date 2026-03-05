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

    // 1. Log user message to Slack (for full history visibility)
    if (slackThread) {
      try {
        await this.notifier.logUserMessage(slackThread, message);
      } catch (error) {
        this.logger.warn(`Slack logging failed for user message: ${(error as Error).message}`);
      }
    }

    // 2. Start Slack thread if new conversation
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

    // 3. Fetch history
    let history = [];
    try {
      history = await this.repository.getHistory(sessionId, 6);
    } catch (error) {
      this.logger.warn(`History fetch failed: ${(error as Error).message}`);
    }

    // 4. Generate embedding
    const embedding = await this.ai.generateEmbedding(message);

    // 5. Vector search
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

    // 6. Save User message
    try {
      await this.repository.saveMessage(sessionId, 'user', message);
    } catch (error) {
      this.logger.warn(`Save user message failed: ${(error as Error).message}`);
    }

    // 7. Stream and accumulate response
    let fullResponse = "";
    const streamStart = performance.now();
    const stream = this.ai.generateResponseStream(message, systemPrompt, history);

    this.telemetry.incrementLlmRequests();

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }
    this.telemetry.observeLlmLatency(performance.now() - streamStart);

    // 8. Final sync: save to DB and log to Slack
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
