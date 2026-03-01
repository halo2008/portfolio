import { Controller, Post, Delete, Get, Body, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { Roles } from '../../../../core/auth/roles.decorator';
import { KnowledgeAtom } from '../../domain/entities/knowledge-atom.entity';
import { IngestBatchUseCase, IngestionResult } from '../../application/use-cases/ingest-batch.use-case';
import { DeleteKnowledgeUseCase } from '../../application/use-cases/delete-knowledge.use-case';
import { GetKnowledgeStatsUseCase } from '../../application/use-cases/get-knowledge-stats.use-case';

@Controller('internal/ingest')
export class KnowledgeController {
    constructor(
        private readonly ingestBatchUseCase: IngestBatchUseCase,
        private readonly deleteKnowledgeUseCase: DeleteKnowledgeUseCase,
        private readonly getKnowledgeStatsUseCase: GetKnowledgeStatsUseCase,
    ) { }

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
