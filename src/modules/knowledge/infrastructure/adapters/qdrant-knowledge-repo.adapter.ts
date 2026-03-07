import { ForbiddenException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { KnowledgeFilter, KnowledgeRepoPort, RagSecurityContext } from '../../domain/ports/knowledge-repo.port';
import { QDRANT_CLIENT } from '../../../qdrant/qdrant.provider';

interface QdrantFilter {
    must?: Array<{
        key: string;
        match: { value?: string; any?: string[] };
    }>;
}

@Injectable()
export class QdrantKnowledgeRepoAdapter implements KnowledgeRepoPort, OnModuleInit {
    private readonly logger = new Logger(QdrantKnowledgeRepoAdapter.name);
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) { }

    async onModuleInit() {
        await this.ensureCollectionExists();
        await this.ensurePayloadIndexes();
    }

    private async ensureCollectionExists() {
        try {
            await this.qdrantClient.getCollection(this.COLLECTION_NAME);
            this.logger.log(`Qdrant collection '${this.COLLECTION_NAME}' already exists.`);
        } catch (e: any) {
            // Only attempt to create if it's a "not found" error, not a network error
            if (e?.status === 404 || e?.message?.includes('Not found') || e?.message?.includes('doesn\'t exist')) {
                try {
                    await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
                        vectors: { size: 768, distance: 'Cosine' }
                    });
                    this.logger.log(`Created Qdrant collection: ${this.COLLECTION_NAME}`);
                } catch (createError) {
                    this.logger.error(`Failed to create Qdrant collection: ${createError instanceof Error ? createError.message : createError}`);
                }
            } else {
                // Network error or other issue — don't crash, just log
                this.logger.warn(`Qdrant not reachable during startup, collection check skipped: ${e instanceof Error ? e.message : e}`);
            }
        }
    }

    private async ensurePayloadIndexes() {
        const indexes = [
            { field_name: 'user_id', field_schema: 'keyword' as const },
            { field_name: 'role', field_schema: 'keyword' as const },
        ];

        for (const index of indexes) {
            try {
                await this.qdrantClient.createPayloadIndex(this.COLLECTION_NAME, index);
                this.logger.log(`Ensured payload index: ${index.field_name}`);
            } catch (e: any) {
                // Index already exists — safe to ignore
                if (!e?.message?.includes('already exists')) {
                    this.logger.warn(`Failed to create index ${index.field_name}: ${e?.message}`);
                }
            }
        }
    }

    private validateContext(context: RagSecurityContext | undefined): asserts context is RagSecurityContext {
        if (!context) {
            this.logger.warn('Security context is missing - rejecting operation');
            throw new ForbiddenException('Security context is required for this operation');
        }

        if (!context.userId || typeof context.userId !== 'string') {
            this.logger.warn({ context }, 'Security context has invalid userId');
            throw new ForbiddenException('Security context is ambiguous: invalid userId');
        }

        if (!context.role || typeof context.role !== 'string') {
            this.logger.warn({ context }, 'Security context has invalid role');
            throw new ForbiddenException('Security context is ambiguous: invalid role');
        }
    }

    private buildUserFilter(userId: string, chunkingStrategy?: 'llm' | 'heuristic'): QdrantFilter {
        const must: QdrantFilter['must'] = [
            { key: 'user_id', match: { value: userId } },
        ];
        if (chunkingStrategy) {
            must.push({ key: 'chunking_strategy', match: { value: chunkingStrategy } });
        }
        return { must };
    }

    private buildAdminFilter(): QdrantFilter {
        return {
            must: [
                { key: 'role', match: { value: 'admin' } }
            ]
        };
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

    async searchAdminKnowledge(
        query: number[],
        context: RagSecurityContext
    ): Promise<string> {
        this.validateContext(context);

        if (context.role !== 'admin') {
            this.logger.warn({
                userId: context.userId,
                role: context.role,
            }, 'Unauthorized attempt to search admin knowledge');
            throw new ForbiddenException('Only admin users can search admin knowledge');
        }

        const filter = this.buildAdminFilter();

        try {
            const results = await this.qdrantClient.search(this.COLLECTION_NAME, {
                vector: query,
                limit: 5,
                with_payload: true,
                with_vector: false,
                score_threshold: 0.7,
                filter,
            });

            this.logger.debug({
                msg: 'Admin knowledge search performed',
                userId: context.userId,
                resultsCount: results.length,
            });

            return this.formatSearchResults(results);
        } catch (error) {
            this.logger.error({
                msg: 'Admin knowledge search failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: context.userId,
            });
            return '';
        }
    }

    async searchUserKnowledge(
        query: number[],
        userId: string,
        context: RagSecurityContext,
        scoreThreshold = 0.7,
        chunkingStrategy?: 'llm' | 'heuristic',
    ): Promise<string> {
        this.validateContext(context);

        // Strict isolation: requester must match target user
        if (context.userId !== userId) {
            this.logger.warn({
                requesterId: context.userId,
                targetUserId: userId,
            }, 'User attempted to search another user\'s knowledge');
            throw new ForbiddenException('Cannot search knowledge belonging to another user');
        }

        if (context.role !== 'demo') {
            this.logger.warn({
                userId: context.userId,
                role: context.role,
            }, 'Non-demo user attempted to search user knowledge');
            throw new ForbiddenException('User knowledge search is only available for demo users');
        }

        const filter = this.buildUserFilter(userId, chunkingStrategy);

        try {
            const results = await this.qdrantClient.search(this.COLLECTION_NAME, {
                vector: query,
                limit: 5,
                with_payload: true,
                with_vector: false,
                score_threshold: scoreThreshold,
                filter,
            });

            this.logger.debug({
                msg: 'User knowledge search performed',
                userId,
                resultsCount: results.length,
            });

            return this.formatSearchResults(results);
        } catch (error) {
            this.logger.error({
                msg: 'User knowledge search failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            return '';
        }
    }

    async deleteByUserId(userId: string, context: RagSecurityContext): Promise<number> {
        this.validateContext(context);

        if (context.role !== 'demo' || context.userId !== userId) {
            this.logger.warn({
                requesterId: context.userId,
                targetUserId: userId,
                role: context.role,
            }, 'Unauthorized attempt to delete user knowledge');
            throw new ForbiddenException('Can only delete your own knowledge');
        }

        const filter = this.buildUserFilter(userId);

        try {
            const result = await this.qdrantClient.delete(this.COLLECTION_NAME, {
                wait: true,
                filter,
            });

            this.logger.log({
                msg: 'Deleted user knowledge',
                userId,
                operationId: result.operation_id,
            });

            return result.operation_id ? 1 : 0;
        } catch (error) {
            this.logger.error({
                msg: 'Failed to delete user knowledge',
                error: error instanceof Error ? error.message : 'Unknown error',
                userId,
            });
            throw error;
        }
    }

    async count(context: RagSecurityContext): Promise<number> {
        this.validateContext(context);

        let filter: QdrantFilter;

        if (context.role === 'demo') {
            filter = this.buildUserFilter(context.userId);
        } else if (context.role === 'admin') {
            filter = this.buildAdminFilter();
        } else {
            this.logger.warn({
                userId: context.userId,
                role: context.role,
            }, 'Count operation rejected for unsupported role');
            throw new ForbiddenException('Count operation not allowed for this role');
        }

        try {
            // Qdrant lacks a direct count API, so we use scroll
            const response = await this.qdrantClient.scroll(this.COLLECTION_NAME, {
                limit: 10000, // Reasonable upper limit for count
                with_payload: false,
                with_vector: false,
                filter,
            });

            this.logger.debug({
                msg: 'Knowledge count performed',
                userId: context.userId,
                role: context.role,
                count: response.points.length,
            });

            return response.points.length;
        } catch (error) {
            this.logger.error({
                msg: 'Knowledge count failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: context.userId,
                role: context.role,
            });
            return 0;
        }
    }

    private formatSearchResults(results: Array<{
        payload?: Record<string, unknown>;
        score?: number;
    }>): string {
        return results
            .map((res) => {
                const content = res.payload?.content as string || '';
                const category = res.payload?.category as string | undefined;
                const techs = res.payload?.technologies as string[] | undefined;
                let meta = '';
                if (category || techs) {
                    meta = ` [${[category, ...(techs || [])].filter(Boolean).join(', ')}]`;
                }
                return content + meta;
            })
            .join('\n\n');
    }
}
