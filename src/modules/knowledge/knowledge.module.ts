import { Module, forwardRef } from '@nestjs/common';
import { QdrantModule } from '../qdrant/qdrant.module';
import { LabModule } from '../lab/lab.module';
import { KnowledgeController } from './infrastructure/delivery/knowledge.controller';
import { IngestBatchUseCase } from './application/use-cases/ingest-batch.use-case';
import { DeleteKnowledgeUseCase } from './application/use-cases/delete-knowledge.use-case';
import { GetKnowledgeStatsUseCase } from './application/use-cases/get-knowledge-stats.use-case';
import { KNOWLEDGE_REPO_PORT } from './domain/ports/knowledge-repo.port';
import { QdrantKnowledgeRepoAdapter } from './infrastructure/adapters/qdrant-knowledge-repo.adapter';
import { EMBEDDING_PROVIDER_PORT } from './domain/ports/embedding-provider.port';
import { GoogleEmbeddingAdapter } from './infrastructure/adapters/google-embedding.adapter';
import { RERANKING_PORT } from './domain/ports/reranking.port';
import { GeminiRerankingAdapter } from './infrastructure/adapters/gemini-reranking.adapter';
import { ConfirmAdminIndexUseCase } from './application/use-cases/confirm-admin-index.use-case';
import { AdminSettingsService } from './application/services/admin-settings.service';
import { FirestoreModule } from '../../core/firestore/firestore.module';

@Module({
    imports: [QdrantModule, forwardRef(() => LabModule), FirestoreModule],
    controllers: [KnowledgeController],
    providers: [
        {
            provide: KNOWLEDGE_REPO_PORT,
            useClass: QdrantKnowledgeRepoAdapter
        },
        {
            provide: EMBEDDING_PROVIDER_PORT,
            useClass: GoogleEmbeddingAdapter
        },
        {
            provide: RERANKING_PORT,
            useClass: GeminiRerankingAdapter
        },
        IngestBatchUseCase,
        DeleteKnowledgeUseCase,
        GetKnowledgeStatsUseCase,
        ConfirmAdminIndexUseCase,
        AdminSettingsService,
    ],
    exports: [
        KNOWLEDGE_REPO_PORT,
        EMBEDDING_PROVIDER_PORT,
        RERANKING_PORT,
        AdminSettingsService,
    ]
})
export class KnowledgeModule { }
