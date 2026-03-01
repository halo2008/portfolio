import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingProviderPort } from '../../domain/ports/embedding-provider.port';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GoogleEmbeddingAdapter implements EmbeddingProviderPort {
    private readonly logger = new Logger(GoogleEmbeddingAdapter.name);
    private ai: GoogleGenAI;

    constructor() {
        this.ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: { apiVersion: 'v1beta' }
        });
    }

    async generateEmbeddings(chunks: string[]): Promise<number[][]> {
        try {
            const embeddings: number[][] = [];

            // API expects individual calls or a proper batch format. 
            // Looping sequentially (or via Promise.all) is safest for arbitrary chunk sizes.
            for (const chunk of chunks) {
                const response = await this.ai.models.embedContent({
                    model: 'gemini-embedding-001',
                    contents: chunk,
                    config: { taskType: 'RETRIEVAL_DOCUMENT' }
                });

                const values = response.embeddings?.[0]?.values;
                if (values) {
                    embeddings.push(values);
                }
            }

            return embeddings;
        } catch (error) {
            this.logger.error(`Error generating embeddings: ${error.message}`);
            throw error;
        }
    }
}
