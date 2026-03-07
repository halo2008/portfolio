import { Inject, Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { EMBEDDING_PROVIDER_PORT, EmbeddingProviderPort } from '../../../knowledge/domain/ports/embedding-provider.port';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';
import { LabUsageService } from '../services/lab-usage.service';

export interface SemanticChunk {
    content: string;
    title?: string;
}

export interface ConfirmIndexInput {
    chunks: SemanticChunk[];
    userId: UserId;
    language: 'pl' | 'en';
}

export interface IndexResultDto {
    vectorIds: string[];
    chunkCount: number;
    language: 'pl' | 'en';
}

const MAX_CHUNKS_PER_SESSION = 100;

@Injectable()
export class ConfirmIndexUseCase {
    private readonly logger = new Logger(ConfirmIndexUseCase.name);

    constructor(
        @Inject(EMBEDDING_PROVIDER_PORT)
        private readonly embeddingProvider: EmbeddingProviderPort,
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
        private readonly labUsageService: LabUsageService,
    ) { }

    async execute(input: ConfirmIndexInput): Promise<IndexResultDto> {
        const { chunks, userId, language } = input;

        this.logger.log(
            { userId: userId.toString(), chunkCount: chunks.length, language },
            'Starting chunk indexing',
        );

        this.validateRateLimit(chunks);

        if (chunks.length === 0) {
            throw new BadRequestException('No chunks provided for indexing');
        }

        const embeddings = await this.generateEmbeddings(chunks);
        const points = this.buildPoints(chunks, embeddings, userId, language);
        await this.knowledgeRepo.upsertPoints(points);
        await this.labUsageService.recordIndexing(userId.toString(), points.length);
        const vectorIds = points.map((point) => String(point.id));

        this.logger.log(
            {
                userId: userId.toString(),
                chunkCount: chunks.length,
                language,
                vectorIdsCount: vectorIds.length,
            },
            'Chunk indexing completed',
        );

        return {
            vectorIds,
            chunkCount: chunks.length,
            language,
        };
    }

    private validateRateLimit(chunks: SemanticChunk[]): void {
        if (chunks.length > MAX_CHUNKS_PER_SESSION) {
            this.logger.warn(
                { chunkCount: chunks.length, maxAllowed: MAX_CHUNKS_PER_SESSION },
                'Rate limit exceeded - too many chunks',
            );
            throw new BadRequestException(
                `Too many chunks: ${chunks.length}. Maximum allowed: ${MAX_CHUNKS_PER_SESSION} per session.`,
            );
        }
    }

    private async generateEmbeddings(chunks: SemanticChunk[]): Promise<number[][]> {
        const texts = chunks.map((chunk) => chunk.content);

        try {
            const embeddings = await this.embeddingProvider.generateEmbeddings(texts);

            this.logger.debug(
                { embeddingCount: embeddings.length },
                'Embeddings generated successfully',
            );

            return embeddings;
        } catch (error) {
            this.logger.error(
                { error: (error as Error).message },
                'Failed to generate embeddings',
            );
            throw error;
        }
    }

    /** Payload uses snake_case per Qdrant convention */
    private buildPoints(
        chunks: SemanticChunk[],
        embeddings: number[][],
        userId: UserId,
        language: 'pl' | 'en',
    ): Array<{
        id: string;
        vector: number[];
        payload: Record<string, unknown>;
    }> {
        const now = new Date().toISOString();
        const userIdStr = userId.toString();

        return chunks.map((chunk, index) => {
            const embedding = embeddings[index];

            if (!embedding) {
                throw new Error(`Missing embedding for chunk at index ${index}`);
            }

            // Qdrant requires valid UUID v4 or 64-bit unsigned int for point IDs
            const id = uuidv4();

            return {
                id,
                vector: embedding,
                payload: {
                    user_id: userIdStr,
                    role: 'demo',
                    title: chunk.title || '',
                    content: chunk.content,
                    language,
                    created_at: now,
                },
            };
        });
    }
}
