import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
    imports: [QdrantModule],
    controllers: [IngestionController],
    providers: [IngestionService],
})
export class IngestionModule { }
