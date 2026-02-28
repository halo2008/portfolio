import { Inject, Injectable, Logger } from '@nestjs/common';
import { QDRANT_CLIENT } from '../modules/qdrant/qdrant.provider';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenAI } from '@google/genai'; // Nowy Unified SDK
import { v4 as uuidv4 } from 'uuid'; // Zmiana: uuidv4 zamiast v5 dla unikalnych ID
import { KnowledgeAtom } from './ingestion.controller';

export interface IngestionResult {
    inserted: number;
    duplicates: number;
    errors: number;
    ids: string[];
}

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);
    private ai: GoogleGenAI;
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) {
        // Inicjalizacja wg nowej dokumentacji v1.41.0
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    /**
     * Explaining: New batch ingestion with deduplication and better ID strategy.
     */
    async processBatch(items: KnowledgeAtom[]): Promise<IngestionResult> {
        await this.ensureCollectionExists();

        const result: IngestionResult = { inserted: 0, duplicates: 0, errors: 0, ids: [] };
        const allPoints = [];

        for (const item of items) {
            // Explaining: Skip items that already exist (check by hash of content)
            const existingHash = await this.checkForDuplicate(item.text);
            if (existingHash) {
                this.logger.warn(`Duplicate content detected, skipping: ${item.category}`);
                result.duplicates++;
                continue;
            }

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
                        // Explaining: Using uuidv4 for unique IDs instead of content-based hash.
                        // This allows content updates without ID conflicts.
                        const pointId = uuidv4();
                        allPoints.push({
                            id: pointId,
                            vector: embedding.values,
                            payload: {
                                content: chunk,
                                category: item.category,
                                technologies: item.tags,
                                timestamp: new Date().toISOString(),
                                source: 'ingestion_batch',
                                contentHash: this.hashContent(item.text), // For deduplication tracking
                            },
                        });
                        result.ids.push(pointId);
                    });
                }
            } catch (err) {
                this.logger.error(`Error embedding category ${item.category}: ${err.message}`);
                result.errors++;
            }
        }

        if (allPoints.length > 0) {
            await this.qdrantClient.upsert(this.COLLECTION_NAME, {
                wait: true,
                points: allPoints
            });
            result.inserted = allPoints.length;
        }

        this.logger.log(`Ingestion complete: ${result.inserted} inserted, ${result.duplicates} duplicates skipped, ${result.errors} errors`);
        return result;
    }

    /**
     * Explaining: Delete knowledge by category or specific content hash.
     */
    async deleteKnowledge(filter: { category?: string; contentHash?: string; id?: string }): Promise<number> {
        if (filter.id) {
            // Delete by specific point ID
            await this.qdrantClient.delete(this.COLLECTION_NAME, {
                wait: true,
                points: [filter.id],
            });
            this.logger.log(`Deleted point: ${filter.id}`);
            return 1;
        }

        // Delete by filter
        const must = [];
        if (filter.category) {
            must.push({ key: 'category', match: { value: filter.category } });
        }
        if (filter.contentHash) {
            must.push({ key: 'contentHash', match: { value: filter.contentHash } });
        }

        if (must.length === 0) {
            throw new Error('At least one filter (category, contentHash, or id) is required for deletion');
        }

        const result = await this.qdrantClient.delete(this.COLLECTION_NAME, {
            wait: true,
            filter: { must },
        });

        this.logger.log(`Deleted points matching filter: ${JSON.stringify(filter)}`);
        return result.operation_id ? 1 : 0; // Qdrant doesn't return count, we estimate
    }

    /**
     * Explaining: List all knowledge categories with counts.
     */
    async getKnowledgeStats(): Promise<Record<string, number>> {
        const response = await this.qdrantClient.scroll(this.COLLECTION_NAME, {
            limit: 1000,
            with_payload: true,
            with_vector: false,
        });

        const stats: Record<string, number> = {};
        for (const point of response.points) {
            const category = point.payload?.category as string;
            if (category) {
                stats[category] = (stats[category] || 0) + 1;
            }
        }

        return stats;
    }

    /**
     * Explaining: Check if similar content already exists using hash.
     */
    private async checkForDuplicate(text: string): Promise<boolean> {
        const hash = this.hashContent(text);
        const response = await this.qdrantClient.scroll(this.COLLECTION_NAME, {
            limit: 1,
            filter: {
                must: [{ key: 'contentHash', match: { value: hash } }],
            },
            with_payload: false,
            with_vector: false,
        });
        return response.points.length > 0;
    }

    /**
     * Explaining: Simple hash function for content deduplication.
     */
    private hashContent(text: string): string {
        // Simple hash - in production use crypto.createHash('sha256')
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
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
            this.logger.log('Created Qdrant collection: portfolio');
        }
    }
}
