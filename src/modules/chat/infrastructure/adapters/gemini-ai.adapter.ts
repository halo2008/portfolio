import { ChatProviderPort } from '../../domain/ports/chat-provider.port';
import { ChatMessage } from '../../domain/entities/chat-message.entity';
// Explaining: Using the new, recommended @google/genai SDK (v1.x).
import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class GeminiAiAdapter implements ChatProviderPort {
    private ai: GoogleGenAI;

    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(GeminiAiAdapter.name);
        // Explaining: Initialization using the new GoogleGenAI constructor.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('CRITICAL: GEMINI_API_KEY is missing. AI infrastructure failure.');
        }
        this.ai = new GoogleGenAI({
            apiKey,
            httpOptions: { apiVersion: 'v1' } // Explaining: MUST use v1 for text-embedding-004 to work (v1beta throws NOT_FOUND)
        });
    }

    /**
     * Explaining: Implements the new streaming pattern.
     * The generateContentStream method now returns an AsyncIterable directly.
     */
    async *generateResponseStream(message: string, context: string, history: ChatMessage[]): AsyncGenerator<string> {
        // Explaining: Mapping our Domain History to the SDK's Content structure.
        const contents = [
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        try {
            const start = Date.now();
            this.logger.info({
                msg: 'Starting Gemini stream',
                historyLength: history.length,
                inputLength: message.length
            });

            const response = await this.ai.models.generateContentStream({
                model: 'gemini-3-flash-preview', // Explaining: Must be gemini-3-flash-preview, NOT 3.0
                contents,
                config: {
                    systemInstruction: context,
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                },
            });

            this.logger.info({
                msg: 'Gemini stream started',
                model: 'gemini-3.0-flash-preview',
            });

            let tokenCount = 0;
            let hasReceivedChunks = false;

            // Explaining: Iterating over the response stream chunks.
            for await (const chunk of response) {
                if (chunk.text) {
                    hasReceivedChunks = true;
                    tokenCount++;
                    yield chunk.text;
                }
            }

            const duration = Date.now() - start;
            this.logger.info({
                msg: 'Gemini stream complete',
                durationMs: duration,
                chunks: tokenCount,
                receivedChunks: hasReceivedChunks
            });

            // If no chunks received, yield an error message
            if (!hasReceivedChunks) {
                this.logger.warn('No chunks received from Gemini');
                yield '[AI did not generate a response. Please try again.]';
            }
        } catch (error) {
            this.logger.error({ msg: 'Gemini Stream Error', error: error.message, stack: error.stack });
            throw new Error('Failed to generate AI response.');
        }
    }

    /**
     * Explaining: Vector embedding generation using the new models.embedContent method.
     * CRITICAL: Must use SAME model as ingestion (text-embedding-004)!
     */
    async generateEmbedding(text: string): Promise<number[]> {
        try {
            this.logger.info({ msg: 'Generating embedding', textLength: text.length });

            const result = await this.ai.models.embedContent({
                model: 'gemini-embedding-001',
                contents: [{ text }],
                config: { taskType: 'RETRIEVAL_QUERY' },
            });

            const embedding = result.embeddings?.[0]?.values;

            if (!embedding) {
                throw new Error('Failed to generate embedding: empty result.');
            }

            this.logger.info({ msg: 'Embedding generated', dimension: embedding.length });
            return embedding;
        } catch (error) {
            this.logger.error({ msg: 'Embedding generation failed', error: error.message });
            throw error;
        }
    }
}
