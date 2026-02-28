import { ChatProviderPort } from '../domain/ports/chat-provider.port';
import { PersistencePort } from '../domain/ports/persistence.port';
import { VectorDbPort } from '../domain/ports/vector-db.port';
import { NotificationPort } from '../domain/ports/notification.port';
import { TelemetryPort } from '../domain/ports/telemetry.port';
import { KONRAD_SYSTEM_PROMPT } from '../domain/chat.constants';

export class GenerateChatResponseUseCase {
  constructor(
    private readonly ai: ChatProviderPort,
    private readonly repository: PersistencePort,
    private readonly vectorDb: VectorDbPort,
    private readonly notifier: NotificationPort,
    private readonly telemetry: TelemetryPort,
  ) { }

  async *execute(message: string, sessionId: string, slackThread?: string | null): AsyncGenerator<string> {
    console.log(`[ChatUseCase] Starting execute. sessionId=${sessionId}, message="${message.substring(0, 50)}"`);

    // CHECK: Is human mode active? If so, don't respond.
    const isHumanMode = await this.repository.isHumanMode(sessionId);
    if (isHumanMode) {
      console.log(`[ChatUseCase] Human mode active for ${sessionId}, skipping AI response`);
      yield "[Konrad has taken over the conversation. AI is paused.]";
      return;
    }

    // 1. Log user message to Slack (for full history visibility)
    if (slackThread) {
      try {
        await this.notifier.logUserMessage(slackThread, message);
        console.log(`[ChatUseCase] User message logged to Slack thread`);
      } catch (e) {
        console.error(`[ChatUseCase] Failed to log user message to Slack:`, e.message);
      }
    }

    // 2. Logging to Slack via Port (Notification Adapter handles details)
    let threadTs = slackThread;
    if (!threadTs) {
      try {
        threadTs = await this.notifier.logConversationStart(message, sessionId);
        console.log(`[ChatUseCase] Step 1 OK: Slack notified, thread=${threadTs}`);

        // Explaining: CRITICAL - Link Slack thread to socket session for human-in-the-loop responses.
        if (threadTs) {
          await this.repository.linkThread(threadTs, sessionId);
          console.log(`[ChatUseCase] Step 1b OK: Thread linked ${threadTs} -> ${sessionId}`);
        }
      } catch (e) {
        console.error(`[ChatUseCase] Step 1 FAILED (Slack):`, e.message);
      }
    }

    // 3. Fetch history
    let history = [];
    try {
      history = await this.repository.getHistory(sessionId, 6);
      console.log(`[ChatUseCase] Step 2 OK: History fetched, ${history.length} messages`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 2 FAILED (Firestore getHistory):`, e.message, e.stack);
    }

    // 4. Generate embedding
    let embedding: number[];
    try {
      embedding = await this.ai.generateEmbedding(message);
      console.log(`[ChatUseCase] Step 3 OK: Embedding generated, dim=${embedding.length}`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 3 FAILED (Gemini embedding):`, e.message, e.stack);
      throw e;
    }

    // 5. Vector search
    let context = '';
    const vectorSearchStart = performance.now();
    try {
      context = await this.vectorDb.search(embedding, 0.6);
      console.log(`[ChatUseCase] Step 4 OK: Qdrant search done, context length=${context.length}`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 4 FAILED (Qdrant search):`, e.message);
    } finally {
      this.telemetry.observeVectorSearchLatency(performance.now() - vectorSearchStart);
    }

    const systemPrompt = KONRAD_SYSTEM_PROMPT(context);

    // 6. Save User message
    try {
      await this.repository.saveMessage(sessionId, 'user', message);
      console.log(`[ChatUseCase] Step 5 OK: User message saved`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 5 FAILED (Firestore save):`, e.message, e.stack);
    }

    // 7. Stream and accumulate response
    let fullResponse = "";
    console.log(`[ChatUseCase] Step 6: Starting Gemini stream...`);
    const streamStart = performance.now();
    const stream = this.ai.generateResponseStream(message, systemPrompt, history);

    this.telemetry.incrementLlmRequests();

    for await (const chunk of stream) {
      fullResponse += chunk;
      yield chunk;
    }
    this.telemetry.observeLlmLatency(performance.now() - streamStart);
    console.log(`[ChatUseCase] Step 6 OK: Stream complete, response length=${fullResponse.length}`);

    // 8. Final sync: save to DB and log to Slack
    try {
      await this.repository.saveMessage(sessionId, 'model', fullResponse);
      console.log(`[ChatUseCase] Step 7 OK: Model response saved`);
    } catch (e) {
      console.error(`[ChatUseCase] Step 7 FAILED (Firestore save model):`, e.message);
    }

    try {
      if (threadTs) {
        await this.notifier.logAiResponse(threadTs, fullResponse);
        console.log(`[ChatUseCase] Step 7 OK: Slack response logged`);
      }
    } catch (e) {
      console.error(`[ChatUseCase] Step 7 FAILED (Slack response):`, e.message);
    }
  }
}
