import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

export interface KnowledgeAtom {
    text: string;
    category: 'Cloud' | 'AI' | 'IoT' | 'Experience' | 'Philosophy';
    tags: string[];
}

@Controller('internal/ingest')
export class IngestionController {
    constructor(private readonly ingestionService: IngestionService) { }

    @Post('batch')
    async ingestBatch(
        @Body() data: KnowledgeAtom[],
        @Headers('x-admin-secret') secret: string,
    ) {
        // Blokada na "Klubowiczów" od darmowej kawy
        if (secret !== process.env.ADMIN_SECRET) {
            throw new UnauthorizedException('Wrong secret. Konrad is watching.');
        }

        return await this.ingestionService.processBatch(data);
    }
}