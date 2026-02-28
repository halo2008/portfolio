import { ChatProviderPort } from '../domain/ports/chat-provider.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { VectorDbPort } from '../domain/ports/vector-db.port'; // Explaining: New port for Qdrant.
import { NotificationPort } from '../domain/ports/notification.port'; // Explaining: New port for Slack.
import { KONRAD_SYSTEM_PROMPT } from '../domain/chat.constants';

export class GenerateChatResponseUseCase {
  constructor(
    private readonly ai: ChatProviderPort,
    private readonly repository: PersistencePort,
    private readonly vectorDb: VectorDbPort,
    private readonly notifier: NotificationPort,
  ) {}

  async *execute(message: string, sessionId: string): AsyncGenerator<string> {
    // 1. Logging to Slack via Port (Notification Adapter handles details)
    const slackThread = await this.notifier.logConversationStart(message, sessionId);

    // 2. Fetch history and build RAG context
    const history = await this.repository.getHistory(sessionId, 6);
    const embedding = await this.ai.generateEmbedding(message);
    const context = await this.vectorDb.search(embedding, 0.6); // Explaining: Score threshold saves tokens.

    const systemPrompt = KONRAD_SYSTEM_PROMPT(context);

    // 3. Save User message
    await this.repository.saveMessage(sessionId, 'user', message);

    // 4. Stream and accumulate response
    let fullResponse = "";
    const stream = this.ai.generateResponseStream(message, systemPrompt, history);

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }

    // 5. Final sync: save to DB and log to Slack
    await this.repository.saveMessage(sessionId, 'model', fullResponse);
    await this.notifier.logAiResponse(slackThread, fullResponse);
  }
}