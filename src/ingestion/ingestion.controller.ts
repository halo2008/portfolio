import { Controller, Post, Delete, Get, Body, Headers, UnauthorizedException, Query } from '@nestjs/common';
import { IngestionService, IngestionResult } from './ingestion.service';

export interface KnowledgeAtom {
    text: string;
    category: 'Cloud' | 'AI' | 'IoT' | 'Experience' | 'Philosophy';
    tags: string[];
}

@Controller('internal/ingest')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) { }

    private validateSecret(secret: string): void {
        if (secret !== process.env.ADMIN_SECRET) {
            throw new UnauthorizedException('Wrong secret. Konrad is watching.');
        }
    }

    @Post('batch')
    async ingestBatch(
        @Body() data: KnowledgeAtom[],
        @Headers('x-admin-secret') secret: string,
    ): Promise<IngestionResult> {
        this.validateSecret(secret);
        return await this.ingestionService.processBatch(data);
    }

    @Delete('knowledge')
    async deleteKnowledge(
        @Headers('x-admin-secret') secret: string,
        @Query('category') category?: string,
        @Query('hash') contentHash?: string,
        @Query('id') id?: string,
    ) {
        this.validateSecret(secret);

        const deleted = await this.ingestionService.deleteKnowledge({
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
    async getStats(
        @Headers('x-admin-secret') secret: string,
    ) {
        this.validateSecret(secret);
        const stats = await this.ingestionService.getKnowledgeStats();
        return {
            categories: stats,
            total: Object.values(stats).reduce((a, b) => a + b, 0),
        };
    }
}
