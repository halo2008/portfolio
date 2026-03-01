import { Module } from '@nestjs/common';
import { QdrantModule } from '../qdrant/qdrant.module';
import { KnowledgeController } from './infrastructure/delivery/knowledge.controller';
import { IngestBatchUseCase } from './application/use-cases/ingest-batch.use-case';
import { DeleteKnowledgeUseCase } from './application/use-cases/delete-knowledge.use-case';
import { GetKnowledgeStatsUseCase } from './application/use-cases/get-knowledge-stats.use-case';
import { KNOWLEDGE_REPO_PORT } from './domain/ports/knowledge-repo.port';
import { QdrantKnowledgeRepoAdapter } from './infrastructure/adapters/qdrant-knowledge-repo.adapter';
import { EMBEDDING_PROVIDER_PORT } from './domain/ports/embedding-provider.port';
import { GoogleEmbeddingAdapter } from './infrastructure/adapters/google-embedding.adapter';

@Module({
    imports: [QdrantModule],
    controllers: [KnowledgeController],
    providers: [
        // Adapters -> Ports
        {
            provide: KNOWLEDGE_REPO_PORT,
            useClass: QdrantKnowledgeRepoAdapter
        },
        {
            provide: EMBEDDING_PROVIDER_PORT,
            useClass: GoogleEmbeddingAdapter
        },
        // Use Cases
        IngestBatchUseCase,
        DeleteKnowledgeUseCase,
        GetKnowledgeStatsUseCase
    ],
    exports: []
})
export class KnowledgeModule { }
