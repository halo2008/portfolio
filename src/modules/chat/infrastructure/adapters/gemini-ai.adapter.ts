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
        this.ai = new GoogleGenAI({ apiKey });
    }

    /**
     * Explaining: Implements the new streaming pattern. 
     * The generateContentStream method now returns an AsyncIterable directly.
     */
    async *generateResponseStream(message: string, context: string, history: ChatMessage[]): AsyncGenerator<string> {
        // Explaining: Mapping our Domain History to the SDK's Content structure.
        // The new SDK handles strings or explicit Part/Content arrays.
        const contents = [
            ...history.map(h => ({
                role: h.role, // roles: 'user' | 'model' | 'system'
                parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        try {
            const start = Date.now();
            const response = await this.ai.models.generateContentStream({
                model: 'gemini-2.5-flash', // Updated: Using Gemini 2.5 Flash (stable, widely supported).
                contents,
                config: {
                    // Explaining: System instructions provide the persona grounding (Konrad).
                    systemInstruction: context,
                    temperature: 0.7,
                },
            });

            this.logger.info({
                msg: 'Gemini stream started',
                model: 'gemini-2.0-flash',
                inputLength: message.length
            });

            let tokenCount = 0;

            // Explaining: Iterating over the response stream chunks.
            for await (const chunk of response) {
                if (chunk.text) {
                    tokenCount++; // Approximation
                    yield chunk.text;
                }
            }
            const duration = Date.now() - start;
            this.logger.info({
                msg: 'Gemini stream complete',
                durationMs: duration,
                chunks: tokenCount
            });
        } catch (error) {
            this.logger.error({ msg: 'Gemini Stream Error', error: error.message });
            console.error('Gemini Stream Error:', error);
            throw new Error('Failed to generate AI response.');
        }
    }

    /**
     * Explaining: Vector embedding generation using the new models.embedContent method.
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const result = await this.ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: [{ role: 'user', parts: [{ text }] }],
        });

        // Explaining: Accessing the embedding values from the first result.
        const embedding = result.embeddings?.[0]?.values;

        if (!embedding) {
            throw new Error('Failed to generate embedding: empty result.');
        }

        return embedding;
    }
}