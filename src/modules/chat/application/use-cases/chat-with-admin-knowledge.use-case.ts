import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';

/**
 * Input for chat with admin knowledge use case
 */
export interface ChatWithAdminKnowledgeInput {
    /** The user's query message */
    message: string;
    /** Session ID for tracking */
    sessionId: string;
}

/**
 * Output from chat with admin knowledge use case
 */
export interface ChatWithAdminKnowledgeOutput {
    /** The AI-generated response */
    response: string;
    /** Detected language of the query (pl | en) */
    detectedLanguage: 'pl' | 'en';
}

/**
 * ChatWithAdminKnowledgeUseCase
 * Explaining: Use case for main page chat that answers ONLY from admin knowledge base.
 * Never queries user-specific vectors - strictly admin-only context.
 * Supports both Polish and English queries with automatic language detection.
 */
@Injectable()
export class ChatWithAdminKnowledgeUseCase {
    private readonly logger = new Logger(ChatWithAdminKnowledgeUseCase.name);
    private readonly ai: GoogleGenAI;
    private readonly MODEL_NAME = 'gemini-3-flash-preview';

    constructor(
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('CRITICAL: GEMINI_API_KEY is missing. AI infrastructure failure.');
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Execute the chat use case with admin-only knowledge.
     * Explaining: Queries ONLY admin knowledge vectors, never user data.
     * Detects input language and returns response in the same language.
     * Logs queries for analytics (anonymized).
     * 
     * @param input The chat input (message, sessionId)
     * @param context Security context for authorization
     * @returns Promise with response and detected language
     */
    async execute(
        input: ChatWithAdminKnowledgeInput,
        context: RagSecurityContext,
    ): Promise<ChatWithAdminKnowledgeOutput> {
        const { message, sessionId } = input;

        // Detect language from input
        const detectedLanguage = this.detectLanguage(message);

        // Log query for analytics (anonymized - no message content)
        this.logger.log({
            msg: 'Main page chat query',
            sessionId: this.anonymizeSessionId(sessionId),
            detectedLanguage,
            messageLength: message.length,
        });

        // Generate embedding for the query
        const embedding = await this.generateEmbedding(message);

        // CRITICAL: Query ONLY admin knowledge - never user-specific vectors
        // This enforces payload.role == 'ADMIN' filter at the adapter level
        const knowledgeContext = await this.knowledgeRepo.searchAdminKnowledge(
            embedding,
            context,
        );

        // Generate response using the admin knowledge context
        const response = await this.generateResponse(
            message,
            knowledgeContext,
            detectedLanguage,
        );

        return {
            response,
            detectedLanguage,
        };
    }

    /**
     * Detect language from input message.
     * Explaining: Simple heuristic detection for Polish vs English.
     * Checks for Polish-specific characters and common words.
     * 
     * @param message The input message to analyze
     * @returns 'pl' for Polish, 'en' for English
     */
    private detectLanguage(message: string): 'pl' | 'en' {
        const lowerMessage = message.toLowerCase();

        // Polish-specific characters
        const polishChars = /[ąćęłńóśźż]/;
        // Common Polish words
        const polishWords = /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|tego|tym|dla|nie|tak|proszę|dziękuję)\b/;

        if (polishChars.test(lowerMessage) || polishWords.test(lowerMessage)) {
            return 'pl';
        }

        // Default to English if no Polish indicators found
        return 'en';
    }

    /**
     * Generate embedding for the query text.
     * Explaining: Uses Gemini embedding model for vector search.
     * 
     * @param text The text to embed
     * @returns Vector embedding array
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            this.logger.debug({
                msg: 'Generating embedding for query',
                textLength: text.length,
            });

            const result = await this.ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: [{ text }],
                config: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: 768 },
            });

            const embedding = result.embeddings?.[0]?.values;

            if (!embedding) {
                throw new Error('Failed to generate embedding: empty result');
            }

            return embedding;
        } catch (error) {
            this.logger.error({
                msg: 'Embedding generation failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    /**
     * Generate AI response using admin knowledge context.
     * Explaining: Uses gemini-3-flash-preview with context-specific system prompt.
     * Instructs the model to answer from official knowledge base in the detected language.
     * 
     * @param message The user's query
     * @param context The retrieved admin knowledge context
     * @param language The detected language (pl | en)
     * @returns The generated response text
     */
    private async generateResponse(
        message: string,
        context: string,
        language: 'pl' | 'en',
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(context, language);

        try {
            this.logger.debug({
                msg: 'Generating chat response',
                model: this.MODEL_NAME,
                language,
                contextLength: context.length,
            });

            const response = await this.ai.models.generateContent({
                model: this.MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: message }] }],
                config: {
                    systemInstruction: systemPrompt,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            });

            const text = response.text;

            if (!text) {
                throw new Error('Empty response from Gemini model');
            }

            return text;
        } catch (error) {
            this.logger.error({
                msg: 'Response generation failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            });

            // Return error message in detected language
            return language === 'pl'
                ? 'Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie później.'
                : 'Sorry, an error occurred while generating the response. Please try again later.';
        }
    }

    /**
     * Build system prompt with context and language instructions.
     * Explaining: Instructs the AI to answer from official knowledge base.
     * Language-specific instructions ensure response matches query language.
     * 
     * @param context The retrieved knowledge context
     * @param language The detected language (pl | en)
     * @returns Formatted system prompt
     */
    private buildSystemPrompt(context: string, language: 'pl' | 'en'): string {
        const basePrompt = `You are answering from the official ks-infra.dev knowledge base.`;

        if (language === 'pl') {
            return `${basePrompt}

ZASADY:
1. Odpowiadaj wyłącznie na podstawie poniższego KONTEKSTU.
2. Jeśli odpowiedzi nie ma w KONTEKŚCIE, przyznaj to uprzejmie po polsku.
3. Odpowiadaj zawsze po polsku.
4. Bądź zwięzły i profesjonalny.

KONTEKST:
${context || 'Brak dostępnych informacji w bazie wiedzy.'}`;
        }

        return `${basePrompt}

RULES:
1. Answer ONLY based on the CONTEXT below.
2. If the answer is not in the CONTEXT, admit it politely.
3. Always respond in English.
4. Be concise and professional.

CONTEXT:
${context || 'No specific information found in the knowledge base.'}`;
    }

    /**
     * Anonymize session ID for logging.
     * Explaining: Takes first 8 chars to enable session correlation
     * without exposing full session ID in logs.
     * 
     * @param sessionId The full session ID
     * @returns Anonymized session identifier
     */
    private anonymizeSessionId(sessionId: string): string {
        return sessionId.slice(0, 8) + '...';
    }
}
