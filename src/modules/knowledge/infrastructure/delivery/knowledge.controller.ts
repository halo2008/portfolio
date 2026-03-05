import { Controller, Post, Delete, Get, Body, Query, UseGuards, Inject, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { Roles } from '../../../../core/auth/roles.decorator';
import { KnowledgeAtom } from '../../domain/entities/knowledge-atom.entity';
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
    @Throttle({ demo: { limit: 5, ttl: 60000 } }) // 5 requests per minute for demo users
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
    @Roles('admin') // Only 'admin' role can actually ingest
    async ingestBatch(
        @Body() data: KnowledgeAtom[],
    ): Promise<IngestionResult> {
        return await this.ingestBatchUseCase.execute(data);
    }

    @Post('demo-batch')
    @UseGuards(FirebaseAuthGuard, ThrottlerGuard)
    @UseInterceptors(SecurityInterceptor)
    @Throttle({ demo: { limit: 5, ttl: 60000 } })
    async ingestDemoBatch(
        @Body() body: any,
        @Req() req: RequestWithRagContext,
    ): Promise<any> {
        const context = req.RAG_CONTEXT;
        if (!context?.userId) {
            throw new BadRequestException('Security context missing');
        }

        const userId = UserId.create(context.userId);

        // This expects the format sent by the frontend's KnowledgeManager.tsx 
        // which sends { chunks: [...], category: '...', tags: [...], language: 'pl' }
        const chunks = body.chunks.map((c: any) => ({ content: c.content, title: c.title || '' }));
        const language = body.language || 'pl';

        const result = await this.confirmIndexUseCase.execute({
            chunks,
            userId,
            language,
        });

        // Match expected format for DemoBatch on frontend
        return {
            inserted: result.chunkCount,
            duplicates: 0,
            errors: 0,
            ids: result.vectorIds,
        };
    }

    @Delete('knowledge')
    @UseGuards(FirebaseAuthGuard)
    @Roles('admin') // Only 'admin' role can delete
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
    // Both admin and demo can access this endpoint, but demo gets isolated stats
    async getStats(@Req() req: RequestWithRagContext) {
        const context = req.RAG_CONTEXT;

        // If user is not an admin, they are in demo mode. Return isolated stats.
        if (context?.role !== 'admin') {
            if (!context) throw new BadRequestException('Context missing');
            const demoChunksCount = await this.knowledgeRepo.count(context);
            return {
                categories: { 'Demo Data (Ephemeral)': demoChunksCount },
                total: demoChunksCount,
            };
        }

        // Admin sees total system stats
        const stats = await this.getKnowledgeStatsUseCase.execute();
        return {
            categories: stats,
            total: Object.values(stats).reduce((a, b) => a + b, 0),
        };
    }
}
