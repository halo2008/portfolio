import { Inject, Injectable, Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserId } from '../../domain/value-objects/user-id.vo';
import { EMBEDDING_PROVIDER_PORT, EmbeddingProviderPort } from '../../../knowledge/domain/ports/embedding-provider.port';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';

/**
 * SemanticChunk
 * Explaining: A semantic chunk ready for indexing with title and content.
 */
export interface SemanticChunk {
    content: string;
    title?: string;
}

/**
 * ConfirmIndexInput
 * Explaining: Input parameters for confirming and indexing chunks.
 */
export interface ConfirmIndexInput {
    chunks: SemanticChunk[];
    userId: UserId;
    language: 'pl' | 'en';
}

/**
 * IndexResultDto
 * Explaining: Data transfer object for indexing results.
 */
export interface IndexResultDto {
    vectorIds: string[];
    chunkCount: number;
    language: 'pl' | 'en';
}

/**
 * Maximum number of chunks allowed per indexing session.
 * Explaining: Rate limiting to prevent abuse - max 100 chunks/session.
 */
const MAX_CHUNKS_PER_SESSION = 100;

/**
 * ConfirmIndexUseCase
 * Explaining: Application use case for confirming and indexing semantic chunks.
 * Validates rate limits, generates embeddings, and stores in Qdrant with payload.
 */
@Injectable()
export class ConfirmIndexUseCase {
    private readonly logger = new Logger(ConfirmIndexUseCase.name);

    constructor(
        @Inject(EMBEDDING_PROVIDER_PORT)
        private readonly embeddingProvider: EmbeddingProviderPort,
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
    ) { }

    /**
     * Execute chunk indexing.
     * Explaining: Validates rate limits, generates embeddings using gemini-embedding-001,
     * stores in Qdrant with proper payload, and returns indexing result.
     * @param input The indexing input (chunks, userId, language)
     * @returns Promise with indexing result including vector IDs and chunk count
     * @throws BadRequestException if chunk count exceeds rate limit
     * @throws ForbiddenException if security context is invalid
     */
    async execute(input: ConfirmIndexInput): Promise<IndexResultDto> {
        const { chunks, userId, language } = input;

        this.logger.log(
            { userId: userId.toString(), chunkCount: chunks.length, language },
            'Starting chunk indexing',
        );

        // Validate rate limits (max 100 chunks/session)
        this.validateRateLimit(chunks);

        // Validate chunks are not empty
        if (chunks.length === 0) {
            throw new BadRequestException('No chunks provided for indexing');
        }

        // Generate embeddings using gemini-embedding-001
        const embeddings = await this.generateEmbeddings(chunks);

        // Build Qdrant points with payload
        const points = this.buildPoints(chunks, embeddings, userId, language);

        // Store in Qdrant via knowledge repo
        await this.knowledgeRepo.upsertPoints(points);

        // Extract vector IDs from points
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

    /**
     * Validate rate limit for chunks.
     * Explaining: Enforces max 100 chunks per session to prevent abuse.
     * Throws BadRequestException if limit is exceeded.
     * @param chunks The chunks to validate
     * @throws BadRequestException if chunk count exceeds limit
     */
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

    /**
     * Generate embeddings for chunks.
     * Explaining: Uses GoogleEmbeddingAdapter (gemini-embedding-001) to generate
     * vector embeddings for each chunk's content.
     * @param chunks The semantic chunks to embed
     * @returns Promise with array of embedding vectors
     */
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

    /**
     * Build Qdrant points with payload.
     * Explaining: Creates point objects for Qdrant upsert with proper payload structure:
     * { user_id, role: 'demo', title, content, language, created_at }
     * Uses snake_case for payload fields (Qdrant convention).
     * @param chunks The semantic chunks
     * @param embeddings The embedding vectors
     * @param userId The user ID
     * @param language The detected language
     * @returns Array of Qdrant point objects
     */
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

            // Generate unique ID combining userId and timestamp with index
            const id = `${userIdStr}_${Date.now()}_${index}`;

            return {
                id,
                vector: embedding,
                payload: {
                    user_id: userIdStr,       // snake_case for Qdrant payload
                    role: 'demo',             // Fixed role for lab users
                    title: chunk.title || '', // Optional title
                    content: chunk.content,   // Full content
                    language,                 // Detected language (pl | en)
                    created_at: now,          // ISO timestamp
                },
            };
        });
    }
}
