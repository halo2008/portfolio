import { Inject, Injectable, Logger } from '@nestjs/common';
import { QDRANT_CLIENT } from '../modules/qdrant/qdrant.provider';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenAI } from '@google/genai'; // Nowy Unified SDK
import { v5 as uuidv5 } from 'uuid';
import { KnowledgeAtom } from './ingestion.controller';

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);
    private ai: GoogleGenAI;
    private readonly COLLECTION_NAME = 'portfolio';
    private readonly NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) {
        // Inicjalizacja wg nowej dokumentacji v1.41.0
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    async processBatch(items: KnowledgeAtom[]) {
        await this.ensureCollectionExists();
        const allPoints = [];

        for (const item of items) {
            const chunks = this.chunkText(item.text, 500, 100);

            try {
                const response = await this.ai.models.embedContent({
                    model: 'text-embedding-004',
                    contents: chunks,
                    config: { taskType: 'RETRIEVAL_DOCUMENT' }
                });

                if (response.embeddings) {
                    response.embeddings.forEach((embedding, index) => {
                        const chunk = chunks[index];
                        allPoints.push({
                            id: uuidv5(chunk, this.NAMESPACE_UUID),
                            vector: embedding.values,
                            payload: {
                                content: chunk,
                                category: item.category,
                                technologies: item.tags,
                                timestamp: new Date().toISOString(),
                                source: 'unified_genai_batch'
                            },
                        });
                    });
                }
            } catch (err) {
                this.logger.error(`Error embedding category ${item.category}: ${err.message}`);
            }
        }

        if (allPoints.length > 0) {
            await this.qdrantClient.upsert(this.COLLECTION_NAME, {
                wait: true,
                points: allPoints
            });
        }

        return { status: 'Success', points: allPoints.length };
    }

    private chunkText(text: string, size: number, overlap: number): string[] {
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            chunks.push(text.slice(i, i + size));
            i += size - overlap;
        }
        return chunks;
    }

    private async ensureCollectionExists() {
        try {
            await this.qdrantClient.getCollection(this.COLLECTION_NAME);
        } catch (e) {
            await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
                vectors: { size: 768, distance: 'Cosine' }
            });
        }
    }
}