import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorDbPort } from '../../domain/ports/vector-db.port';
import { QDRANT_CLIENT } from '../../../../modules/qdrant/qdrant.provider';

interface SearchFilters {
    category?: string;
    technologies?: string[];
}

@Injectable()
export class QdrantVectorDbAdapter implements VectorDbPort {
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(
        @Inject(QDRANT_CLIENT) private readonly client: QdrantClient,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(QdrantVectorDbAdapter.name);
    }

    async search(vector: number[], threshold: number, filters?: SearchFilters): Promise<string> {
        try {
            // Explaining: Build filter conditions based on metadata
            const filter: any = {};

            if (filters?.category) {
                filter.must = filter.must || [];
                filter.must.push({
                    key: 'category',
                    match: { value: filters.category },
                });
            }

            if (filters?.technologies && filters.technologies.length > 0) {
                filter.must = filter.must || [];
                // Match any of the specified technologies
                filter.must.push({
                    key: 'technologies',
                    match: { any: filters.technologies },
                });
            }

            // Explaining: Performing vector search with score threshold and optional metadata filtering.
            const results = await this.client.search(this.COLLECTION_NAME, {
                vector,
                limit: 5,
                with_payload: true,
                score_threshold: threshold,
                ...(Object.keys(filter).length > 0 && { filter }),
            });

            this.logger.debug({
                msg: 'Vector search performed',
                threshold,
                resultsCount: results.length,
                topScore: results[0]?.score || 0,
                filters: filters || 'none',
            });

            // Explaining: Aggregating retrieved fragments into a single context string with metadata.
            return results
                .map((res) => {
                    const content = res.payload?.content || '';
                    const category = res.payload?.category as string | undefined;
                    const techs = res.payload?.technologies as string[] | undefined;
                    let meta = '';
                    if (category || techs) {
                        meta = ` [${[category, ...(techs || [])].filter(Boolean).join(', ')}]`;
                    }
                    return content + meta;
                })
                .join('\n\n');
        } catch (error) {
            this.logger.error({
                msg: 'Qdrant search failed — returning empty context',
                error: error.message,
                stack: error.stack,
            });
            return '';
        }
    }
}
