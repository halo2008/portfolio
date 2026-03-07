import { Controller, Post, Delete, Get, Body, Query, UseGuards, Inject, Req, BadRequestException } from '@nestjs/common';
import { IsString, IsOptional, IsArray, IsIn, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { Roles } from '../../../../core/auth/roles.decorator';
import { IngestBatchUseCase, IngestionResult } from '../../application/use-cases/ingest-batch.use-case';
import { DeleteKnowledgeUseCase } from '../../application/use-cases/delete-knowledge.use-case';
import { GetKnowledgeStatsUseCase } from '../../application/use-cases/get-knowledge-stats.use-case';
import { ANALYSIS_PORT, AnalysisPort } from '../../../lab/domain/ports/analysis.port';
import { ConfirmAdminIndexUseCase, ConfirmAdminIndexInput, AdminIndexResultDto } from '../../application/use-cases/confirm-admin-index.use-case';
import { ConfirmIndexUseCase } from '../../../lab/application/use-cases/confirm-index.use-case';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { RagSecurityContext, KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';
import { SecurityInterceptor } from '../../../lab/infrastructure/security/security.interceptor';
import { UseInterceptors, forwardRef } from '@nestjs/common';
import { UserId } from '../../../lab/domain/value-objects/user-id.vo';

class KnowledgeAtomDto {
    @IsString()
    text!: string;

    @IsString()
    @IsIn(['Cloud', 'AI', 'IoT', 'Experience', 'Philosophy'])
    category!: 'Cloud' | 'AI' | 'IoT' | 'Experience' | 'Philosophy';

    @IsArray()
    @IsString({ each: true })
    tags!: string[];
}

class DemoBatchChunkDto {
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    title?: string;
}

class DemoBatchDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DemoBatchChunkDto)
    @ArrayMinSize(1)
    chunks!: DemoBatchChunkDto[];

    @IsOptional()
    @IsString()
    @IsIn(['pl', 'en'])
    language?: 'pl' | 'en';

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

interface RequestWithRagContext extends Request {
    RAG_CONTEXT?: RagSecurityContext;
}

@Controller('internal/ingest')
export class KnowledgeController {
    constructor(
        private readonly ingestBatchUseCase: IngestBatchUseCase,
        private readonly deleteKnowledgeUseCase: DeleteKnowledgeUseCase,
        private readonly getKnowledgeStatsUseCase: GetKnowledgeStatsUseCase,
        @Inject(ANALYSIS_PORT) private readonly analysisPort: AnalysisPort,
        private readonly confirmAdminIndexUseCase: ConfirmAdminIndexUseCase,
        @Inject(forwardRef(() => ConfirmIndexUseCase))
        private readonly confirmIndexUseCase: ConfirmIndexUseCase,
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort,
    ) { }

    @Post('analyze')
    @UseGuards(FirebaseAuthGuard, ThrottlerGuard)
    @Throttle({ demo: { limit: 5, ttl: 60000 } })
    @Roles('admin')
    async analyzeText(
        @Body('text') text: string,
        @Body('filename') filename: string = 'admin_input.txt',
    ) {
        const analysisResult = await this.analysisPort.analyzeDocument(text, filename);
        return {
            detectedLanguage: analysisResult.detectedLanguage,
            chunks: analysisResult.chunks.map((chunk) => ({
                content: chunk.content,
                startLine: chunk.startLine,
                endLine: chunk.endLine,
            })),
        };
    }

    @Post('confirm-index')
    @UseGuards(FirebaseAuthGuard)
    @Roles('admin')
    async confirmIndex(
        @Body() data: ConfirmAdminIndexInput,
    ): Promise<AdminIndexResultDto> {
        return await this.confirmAdminIndexUseCase.execute(data);
    }

    @Post('batch')
    @UseGuards(FirebaseAuthGuard)
    @Roles('admin')
    async ingestBatch(
        @Body() data: KnowledgeAtomDto[],
    ): Promise<IngestionResult> {
        return await this.ingestBatchUseCase.execute(data);
    }

    @Post('demo-batch')
    @UseGuards(FirebaseAuthGuard, ThrottlerGuard)
    @UseInterceptors(SecurityInterceptor)
    @Throttle({ demo: { limit: 5, ttl: 60000 } })
    async ingestDemoBatch(
        @Body() body: DemoBatchDto,
        @Req() req: RequestWithRagContext,
    ) {
        const context = req.RAG_CONTEXT;
        if (!context?.userId) {
            throw new BadRequestException('Security context missing');
        }

        if (!body.chunks || !Array.isArray(body.chunks) || body.chunks.length === 0) {
            throw new BadRequestException('Chunks array is required and must not be empty');
        }

        const userId = UserId.create(context.userId);

        const chunks = body.chunks.map((c) => ({ content: c.content, title: c.title || '' }));
        const language = body.language || 'pl';

        const result = await this.confirmIndexUseCase.execute({
            chunks,
            userId,
            language,
        });

        return {
            inserted: result.chunkCount,
            duplicates: 0,
            errors: 0,
            ids: result.vectorIds,
        };
    }

    @Get('browse')
    @UseGuards(FirebaseAuthGuard)
    @Roles('admin')
    async browseKnowledge(
        @Query('category') category?: string,
        @Query('limit') limitStr?: string,
        @Query('offset') offset?: string,
    ) {
        const limit = limitStr ? Math.min(parseInt(limitStr, 10) || 20, 100) : 20;
        return await this.knowledgeRepo.browsePoints(category, limit, offset);
    }

    @Delete('knowledge')
    @UseGuards(FirebaseAuthGuard)
    @Roles('admin')
    async deleteKnowledge(
        @Query('category') category?: string,
        @Query('hash') contentHash?: string,
        @Query('id') id?: string,
    ) {
        const deleted = await this.deleteKnowledgeUseCase.execute({
            category,
            contentHash,
            id,
        });

        return {
            success: true,
            deleted,
            filter: { category, contentHash, id },
        };
    }

    @Get('stats')
    @UseGuards(FirebaseAuthGuard)
    @UseInterceptors(SecurityInterceptor)
    async getStats(@Req() req: RequestWithRagContext) {
        const context = req.RAG_CONTEXT;

        // Demo users only see their own isolated stats
        if (context?.role !== 'admin') {
            if (!context) throw new BadRequestException('Context missing');
            const demoChunksCount = await this.knowledgeRepo.count(context);
            return {
                categories: { 'Demo Data (Ephemeral)': demoChunksCount },
                total: demoChunksCount,
            };
        }

        const stats = await this.getKnowledgeStatsUseCase.execute();
        return {
            categories: stats,
            total: Object.values(stats).reduce((a, b) => a + b, 0),
        };
    }
}
