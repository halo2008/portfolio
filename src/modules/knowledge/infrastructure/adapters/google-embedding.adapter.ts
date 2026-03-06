import { Injectable, Logger, Inject } from '@nestjs/common';
import { EmbeddingProviderPort } from '../../domain/ports/embedding-provider.port';
import { GoogleGenAI } from '@google/genai';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';

@Injectable()
export class GoogleEmbeddingAdapter implements EmbeddingProviderPort {
    private readonly logger = new Logger(GoogleEmbeddingAdapter.name);

    constructor(
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
    ) { }

    async generateEmbeddings(chunks: string[]): Promise<number[][]> {
        try {
            const embeddings: number[][] = [];

            // API expects individual calls or a proper batch format. 
            // Looping sequentially (or via Promise.all) is safest for arbitrary chunk sizes.
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const response = await this.ai.models.embedContent({
                    model: 'gemini-embedding-001',
                    contents: chunk,
                    config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: 768 }
                });

                const values = response.embeddings?.[0]?.values;
                if (!values) {
                    this.logger.error(`Empty embedding returned for chunk ${i} (length: ${chunk.length})`);
                    throw new Error(`Failed to generate embedding for chunk ${i}`);
                }
                embeddings.push(values);
            }

            return embeddings;
        } catch (error) {
            this.logger.error(`Error generating embeddings: ${(error as Error).message}`);
            throw error;
        }
    }
}
