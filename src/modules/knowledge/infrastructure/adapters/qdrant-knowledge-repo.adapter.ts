import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { KnowledgeFilter, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';
import { QDRANT_CLIENT } from '../../../qdrant/qdrant.provider';

@Injectable()
export class QdrantKnowledgeRepoAdapter implements KnowledgeRepoPort, OnModuleInit {
    private readonly logger = new Logger(QdrantKnowledgeRepoAdapter.name);
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) { }

    async onModuleInit() {
        await this.ensureCollectionExists();
    }

    private async ensureCollectionExists() {
        try {
            await this.qdrantClient.getCollection(this.COLLECTION_NAME);
        } catch (e) {
            await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
                vectors: { size: 768, distance: 'Cosine' }
            });
            this.logger.log(`Created Qdrant collection: ${this.COLLECTION_NAME}`);
        }
    }

    async checkDuplicate(hash: string): Promise<boolean> {
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

    async upsertPoints(points: any[]): Promise<void> {
        if (points.length === 0) return;
        await this.qdrantClient.upsert(this.COLLECTION_NAME, {
            wait: true,
            points
        });
    }

    async deleteByFilter(filter: KnowledgeFilter): Promise<number> {
        if (filter.id) {
            await this.qdrantClient.delete(this.COLLECTION_NAME, {
                wait: true,
                points: [filter.id],
            });
            return 1;
        }

        const must: any[] = [];
        if (filter.category) {
            must.push({ key: 'category', match: { value: filter.category } });
        }
        if (filter.contentHash) {
            must.push({ key: 'contentHash', match: { value: filter.contentHash } });
        }

        if (must.length === 0) {
            throw new Error('At least one filter is required for deletion');
        }

        const result = await this.qdrantClient.delete(this.COLLECTION_NAME, {
            wait: true,
            filter: { must },
        });

        return result.operation_id ? 1 : 0;
    }

    async getStats(): Promise<Record<string, number>> {
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
}
