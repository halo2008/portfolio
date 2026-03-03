import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';

/**
 * Source citation from retrieved knowledge chunk
 */
export interface SourceCitation {
    /** Title of the source chunk */
    title: string;
    /** Relevance score (0-1) */
    score?: number;
}

/**
 * Input for chat with user knowledge use case
 */
export interface ChatWithUserKnowledgeInput {
    /** The user's query message */
    message: string;
    /** Session ID for tracking */
    sessionId: string;
}

/**
 * Output from chat with user knowledge use case
 */
export interface ChatWithUserKnowledgeOutput {
    /** The AI-generated response */
    response: string;
    /** Detected language of the query (pl | en) */
    detectedLanguage: 'pl' | 'en';
    /** Source citations from retrieved chunks */
    sources: SourceCitation[];
}

/**
 * ChatWithUserKnowledgeUseCase
 * Explaining: Use case for Lab chat that answers ONLY from user's uploaded documents.
 * Never queries admin vectors or other users' data - strictly user-only context.
 * Supports both Polish and English queries with automatic language detection.
 */
@Injectable()
export class ChatWithUserKnowledgeUseCase {
    private readonly logger = new Logger(ChatWithUserKnowledgeUseCase.name);
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
     * Execute the chat use case with user-only knowledge.
     * Explaining: Queries ONLY user's own knowledge vectors via payload.user_id filter.
     * Never includes admin vectors or other users' data.
     * Detects input language and returns response in the same language.
     * Includes source citations (chunk titles) in response.
     * 
     * @param input The chat input (message, sessionId)
     * @param context Security context for authorization (must have role === 'demo')
     * @returns Promise with response, detected language, and source citations
     */
    async execute(
        input: ChatWithUserKnowledgeInput,
        context: RagSecurityContext,
    ): Promise<ChatWithUserKnowledgeOutput> {
        const { message, sessionId } = input;

        // Detect language from input
        const detectedLanguage = this.detectLanguage(message);

        // Log query for analytics (anonymized - no message content)
        this.logger.log({
            msg: 'Lab chat query (user knowledge)',
            sessionId: this.anonymizeSessionId(sessionId),
            userId: context.userId,
            detectedLanguage,
            messageLength: message.length,
        });

        // Generate embedding for the query
        const embedding = await this.generateEmbedding(message);

        // CRITICAL: Query ONLY user's own knowledge - never admin or other users' vectors
        // This enforces payload.user_id == context.userId filter at the adapter level
        const searchResults = await this.knowledgeRepo.searchUserKnowledge(
            embedding,
            context.userId,
            context,
        );

        // Parse search results to extract content and sources
        const { context: knowledgeContext, sources } = this.parseSearchResults(searchResults);

        // Generate response using the user's knowledge context
        const response = await this.generateResponse(
            message,
            knowledgeContext,
            detectedLanguage,
            sources,
        );

        return {
            response,
            detectedLanguage,
            sources,
        };
    }

    /**
     * Detect language from input message.
     * Explaining: Simple heuristic detection for Polish vs English.
     * Checks for Polish-specific characters and common words.
     * Respects user's preferred language from session if ambiguous.
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
                config: { taskType: 'RETRIEVAL_QUERY' },
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
     * Parse search results into context string and source citations.
     * Explaining: Extracts content and titles from Qdrant search results.
     * Titles are used for source citations.
     * 
     * @param searchResults Raw search results from knowledge repo
     * @returns Parsed context string and source citations
     */
    private parseSearchResults(searchResults: string): { context: string; sources: SourceCitation[] } {
        if (!searchResults || searchResults.trim().length === 0) {
            return { context: '', sources: [] };
        }

        // The search results are already formatted as a string by the adapter
        // For citations, we need to extract titles from the metadata
        // Since the adapter returns a formatted string, we'll parse it for now
        // In a future iteration, the adapter could return structured results

        // For now, return empty sources since the adapter returns formatted text
        // The titles are embedded in the context string as [title] metadata
        const sources: SourceCitation[] = [];

        // Try to extract titles from the formatted context
        // Format from adapter: "content [category, tech1, tech2]"
        const lines = searchResults.split('\n\n');
        for (const line of lines) {
            const match = line.match(/\[([^\]]+)\]$/);
            if (match) {
                const meta = match[1];
                // Extract first part as title/category
                const title = meta.split(',')[0]?.trim();
                if (title && !sources.find(s => s.title === title)) {
                    sources.push({ title });
                }
            }
        }

        return { context: searchResults, sources };
    }

    /**
     * Generate AI response using user knowledge context.
     * Explaining: Uses gemini-3-flash-preview with user-specific system prompt.
     * Instructs the model to answer from user's personal knowledge base.
     * Includes source citations in the response.
     * 
     * @param message The user's query
     * @param context The retrieved user knowledge context
     * @param language The detected language (pl | en)
     * @param sources Source citations to include
     * @returns The generated response text
     */
    private async generateResponse(
        message: string,
        context: string,
        language: 'pl' | 'en',
        sources: SourceCitation[],
    ): Promise<string> {
        const systemPrompt = this.buildSystemPrompt(context, language, sources);

        try {
            this.logger.debug({
                msg: 'Generating lab chat response',
                model: this.MODEL_NAME,
                language,
                contextLength: context.length,
                sourceCount: sources.length,
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
                msg: 'Lab response generation failed',
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
     * Explaining: Instructs the AI to answer from user's personal knowledge base.
     * Language-specific instructions ensure response matches query language.
     * Includes source citations if available.
     * 
     * @param context The retrieved knowledge context
     * @param language The detected language (pl | en)
     * @param sources Source citations to include
     * @returns Formatted system prompt
     */
    private buildSystemPrompt(
        context: string,
        language: 'pl' | 'en',
        sources: SourceCitation[],
    ): string {
        const basePrompt = "You are answering from the user's personal knowledge base.";

        // Build sources section
        const sourcesSection = sources.length > 0
            ? sources.map((s, i) => `${i + 1}. ${s.title}`).join('\n')
            : '';

        if (language === 'pl') {
            return `${basePrompt}

ZASADY:
1. Odpowiadaj wyłącznie na podstawie poniższego KONTEKSTU z dokumentów użytkownika.
2. Jeśli odpowiedzi nie ma w KONTEKSTU, przyznaj to uprzejmie po polsku.
3. Odpowiadaj zawsze po polsku.
4. Bądź zwięzły i profesjonalny.
5. Na końcu odpowiedzi podaj źródła (tytuły fragmentów) użyte do udzielenia odpowiedzi.${sourcesSection ? '\n\nDOSTĘPNE ŹRÓDŁA:\n' + sourcesSection : ''}

KONTEKST:
${context || 'Brak dostępnych informacji w bazie wiedzy użytkownika.'}`;
        }

        return `${basePrompt}

RULES:
1. Answer ONLY based on the CONTEXT below from the user's documents.
2. If the answer is not in the CONTEXT, admit it politely.
3. Always respond in English.
4. Be concise and professional.
5. At the end of your response, cite the sources (chunk titles) used to answer.${sourcesSection ? '\n\nAVAILABLE SOURCES:\n' + sourcesSection : ''}

CONTEXT:
${context || 'No specific information found in the user\'s knowledge base.'}`;
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
