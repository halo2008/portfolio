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
  ) { }

  async *execute(message: string, sessionId: string): AsyncGenerator<string> {
    console.log(`[ChatUseCase] Starting execute. sessionId=${sessionId}, message="${message.substring(0, 50)}"`);

    // 1. Logging to Slack via Port (Notification Adapter handles details)
    let slackThread: string | null = null;
    try {
      slackThread = await this.notifier.logConversationStart(message, sessionId);
      console.log(`[ChatUseCase] Step 1 OK: Slack notified, thread=${slackThread}`);

      // Explaining: CRITICAL - Link Slack thread to socket session for human-in-the-loop responses.
      if (slackThread) {
        await this.repository.linkThread(slackThread, sessionId);
        console.log(`[ChatUseCase] Step 1b OK: Thread linked ${slackThread} -> ${sessionId}`);
      }
    } catch (e) {
      console.error(`[ChatUseCase] Step 1 FAILED (Slack):`, e.message);
    }

    // 2. Fetch history
    let history = [];
    try {
      history = await this.repository.getHistory(sessionId, 6);
      console.log(`[ChatUseCase] Step 2 OK: History fetched, ${history.length} messages`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 2 FAILED (Firestore getHistory):`, e.message, e.stack);
      // Continue with empty history
    }

    // 3. Generate embedding
    let embedding: number[];
    try {
      embedding = await this.ai.generateEmbedding(message);
      console.log(`[ChatUseCase] Step 3 OK: Embedding generated, dim=${embedding.length}`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 3 FAILED (Gemini embedding):`, e.message, e.stack);
      throw e; // Can't continue without embedding for RAG
    }

    // 4. Vector search
    let context = '';
    try {
      context = await this.vectorDb.search(embedding, 0.6);
      console.log(`[ChatUseCase] Step 4 OK: Qdrant search done, context length=${context.length}`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 4 FAILED (Qdrant search):`, e.message);
      // Continue with empty context
    }

    const systemPrompt = KONRAD_SYSTEM_PROMPT(context);

    // 5. Save User message
    try {
      await this.repository.saveMessage(sessionId, 'user', message);
      console.log(`[ChatUseCase] Step 5 OK: User message saved`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 5 FAILED (Firestore save):`, e.message, e.stack);
      // Continue — saving is non-critical for the response
    }

    // 6. Stream and accumulate response
    let fullResponse = "";
    console.log(`[ChatUseCase] Step 6: Starting Gemini stream...`);
    const stream = this.ai.generateResponseStream(message, systemPrompt, history);

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }
    console.log(`[ChatUseCase] Step 6 OK: Stream complete, response length=${fullResponse.length}`);

    // 7. Final sync: save to DB and log to Slack
    try {
      await this.repository.saveMessage(sessionId, 'model', fullResponse);
      console.log(`[ChatUseCase] Step 7 OK: Model response saved`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 7 FAILED (Firestore save model):`, e.message);
    }

    try {
      if (slackThread) {
        await this.notifier.logAiResponse(slackThread, fullResponse);
        console.log(`[ChatUseCase] Step 7 OK: Slack response logged`);
      }
    } catch (e) {
      console.error(`[ChatUseCase] Step 7 FAILED (Slack response):`, e.message);
    }
  }
}
