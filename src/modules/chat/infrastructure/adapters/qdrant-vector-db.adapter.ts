import { Inject, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorDbPort } from '../../domain/ports/vector-db.port';
import { QDRANT_CLIENT } from '../../../../modules/qdrant/qdrant.provider';

@Injectable()
export class QdrantVectorDbAdapter implements VectorDbPort {
    private readonly COLLECTION_NAME = 'portfolio';

    constructor(
        @Inject(QDRANT_CLIENT) private readonly client: QdrantClient,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(QdrantVectorDbAdapter.name);
    }

    async search(vector: number[], threshold: number): Promise<string> {
        // Explaining: Performing vector search with a score threshold to filter irrelevant data.
        const results = await this.client.search(this.COLLECTION_NAME, {
            vector,
            limit: 5,
            with_payload: true,
            score_threshold: threshold,
        });

        this.logger.debug({
            msg: 'Vector search performed',
            threshold,
            resultsCount: results.length,
            topScore: results[0]?.score || 0,
        });

        // Explaining: Aggregating retrieved fragments into a single context string.
        return results
            .map((res) => res.payload?.content || '')
            .join('\n\n');
    }
}