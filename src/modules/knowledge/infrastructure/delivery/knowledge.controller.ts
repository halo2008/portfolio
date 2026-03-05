import { Controller, Post, Delete, Get, Body, Query, UseGuards, Inject } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { Roles } from '../../../../core/auth/roles.decorator';
import { KnowledgeAtom } from '../../domain/entities/knowledge-atom.entity';
import { IngestBatchUseCase, IngestionResult } from '../../application/use-cases/ingest-batch.use-case';
import { DeleteKnowledgeUseCase } from '../../application/use-cases/delete-knowledge.use-case';
import { GetKnowledgeStatsUseCase } from '../../application/use-cases/get-knowledge-stats.use-case';
import { ANALYSIS_PORT, AnalysisPort } from '../../../lab/domain/ports/analysis.port';
import { ConfirmAdminIndexUseCase, ConfirmAdminIndexInput, AdminIndexResultDto } from '../../application/use-cases/confirm-admin-index.use-case';

@Controller('internal/ingest')
export class KnowledgeController {
    constructor(
        private readonly ingestBatchUseCase: IngestBatchUseCase,
        private readonly deleteKnowledgeUseCase: DeleteKnowledgeUseCase,
        private readonly getKnowledgeStatsUseCase: GetKnowledgeStatsUseCase,
        @Inject(ANALYSIS_PORT) private readonly analysisPort: AnalysisPort,
        private readonly confirmAdminIndexUseCase: ConfirmAdminIndexUseCase,
    ) { }

    @Post('analyze')
    @UseGuards(FirebaseAuthGuard)
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
    @UseGuards(FirebaseAuthGuard)
    // No specific role required - anyone authenticated can call this
    async ingestDemoBatch(
        @Body() data: KnowledgeAtom[],
    ): Promise<IngestionResult> {
        // Mock successful ingestion without actually touching Qdrant
        return {
            inserted: data.length,
            duplicates: 0,
            errors: 0,
            ids: data.map((_, i) => `mock-id-${i}`),
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
    // No specific role required - view basic stats
    async getStats() {
        const stats = await this.getKnowledgeStatsUseCase.execute();
        return {
            categories: stats,
            total: Object.values(stats).reduce((a, b) => a + b, 0),
        };
    }
}
