import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IsArray, IsString, IsOptional, IsIn, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { v4 as uuidv4 } from 'uuid';
import { EMBEDDING_PROVIDER_PORT, EmbeddingProviderPort } from '../../domain/ports/embedding-provider.port';
import { KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';

class AdminChunkDto {
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    title?: string;
}

export class ConfirmAdminIndexInput {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AdminChunkDto)
    @ArrayMinSize(1)
    chunks!: AdminChunkDto[];

    @IsString()
    @IsIn(['Cloud', 'AI', 'IoT', 'Experience', 'Philosophy'])
    category!: 'Cloud' | 'AI' | 'IoT' | 'Experience' | 'Philosophy';

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsString()
    @IsIn(['pl', 'en'])
    language!: 'pl' | 'en';
}

export interface SemanticChunk {
    content: string;
    title?: string;
}

export interface AdminIndexResultDto {
    inserted: number;
    duplicates: number;
    errors: number;
    ids: string[];
}

@Injectable()
export class ConfirmAdminIndexUseCase {
    private readonly logger = new Logger(ConfirmAdminIndexUseCase.name);

    constructor(
        @Inject(EMBEDDING_PROVIDER_PORT)
        private readonly embeddingProvider: EmbeddingProviderPort,
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
    ) { }

    async execute(input: ConfirmAdminIndexInput): Promise<AdminIndexResultDto> {
        const { chunks, category, tags = [], language } = input;
        const result: AdminIndexResultDto = { inserted: 0, duplicates: 0, errors: 0, ids: [] };

        this.logger.log(
            { chunkCount: chunks.length, category, language },
            'Starting admin chunk indexing',
        );

        if (chunks.length === 0) {
            throw new BadRequestException('No chunks provided for indexing');
        }

        const texts = chunks.map(c => c.content);
        let embeddings: number[][];
        try {
            embeddings = await this.embeddingProvider.generateEmbeddings(texts);
        } catch (error) {
            this.logger.error({ error: (error as Error).message }, 'Failed to generate embeddings');
            result.errors += chunks.length;
            return result;
        }

        const allPoints: any[] = [];
        const now = new Date().toISOString();

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const vector = embeddings[i];

            // We use the full content for hash generation to check duplicates
            const hash = this.hashContent(chunk.content);
            const isDuplicate = await this.knowledgeRepo.checkDuplicate(hash);

            if (isDuplicate) {
                this.logger.warn(`Duplicate chunk detected, skipping title: ${chunk.title}`);
                result.duplicates++;
                continue;
            }

            const pointId = uuidv4();
            allPoints.push({
                id: pointId,
                vector: vector,
                payload: {
                    content: chunk.content,
                    title: chunk.title || '',
                    category: category,
                    technologies: tags,
                    language: language,
                    role: 'admin', // Fixed role for admin
                    timestamp: now,
                    source: 'admin_panel',
                    contentHash: hash,
                },
            });
            result.ids.push(pointId);
        }

        if (allPoints.length > 0) {
            await this.knowledgeRepo.upsertPoints(allPoints);
            result.inserted = allPoints.length;
        }

        this.logger.log(`Admin Ingestion complete: ${result.inserted} inserted, ${result.duplicates} skipped, ${result.errors} errors`);
        return result;
    }

    private hashContent(text: string): string {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }
}
