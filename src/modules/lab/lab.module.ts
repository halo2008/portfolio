import { Module, Provider, forwardRef } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { SecurityInterceptor } from './infrastructure/security/security.interceptor';
import { ANALYSIS_PORT } from './domain/ports/analysis.port';
import { VertexAiAnalysisAdapter } from './infrastructure/adapters/vertex-ai-analysis.adapter';
import { AnalyzeDocumentUseCase } from './application/use-cases/analyze-document.use-case';
import { ConfirmIndexUseCase } from './application/use-cases/confirm-index.use-case';
import { ChatWithUserKnowledgeUseCase } from './application/use-cases/chat-with-user-knowledge.use-case';
import { LabController } from './infrastructure/delivery/lab.controller';
import { LabSessionController } from './infrastructure/delivery/lab-session.controller';
import { CleanupController } from './infrastructure/delivery/cleanup.controller';
import { EPHEMERAL_USER_REPO_PORT } from './domain/ports/ephemeral-user-repo.port';
import { FirestoreEphemeralUserAdapter } from './infrastructure/adapters/firestore-ephemeral-user.adapter';
import { IdentityCleanupService } from './application/services/identity-cleanup.service';
import { FirestoreProvider } from '../../core/firestore/firestore.provider';
import { LabUsageService } from './application/services/lab-usage.service';
import { LabRateLimitGuard } from './infrastructure/security/lab-rate-limit.guard';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import {
    LabMetricsService,
    METRIC_LAB_ANALYSIS_TOTAL,
    METRIC_LAB_INDEXING_TOTAL,
    METRIC_LAB_CHAT_TOTAL,
    METRIC_LAB_EMBEDDING_DURATION,
    METRIC_LAB_CHUNKS_INDEXED,
    METRIC_LAB_SEARCH_DURATION,
    METRIC_LAB_LLM_DURATION,
    METRIC_LAB_CHAT_TOTAL_DURATION,
} from './infrastructure/metrics/lab-metrics.service';
import { ScheduledCleanupController } from './infrastructure/delivery/scheduled-cleanup.controller';

const securityInterceptorProvider: Provider = {
    provide: APP_INTERCEPTOR,
    useClass: SecurityInterceptor,
};

@Module({
    imports: [forwardRef(() => KnowledgeModule)],
    controllers: [LabController, LabSessionController, CleanupController, ScheduledCleanupController],
    providers: [
        securityInterceptorProvider,
        makeCounterProvider({
            name: METRIC_LAB_ANALYSIS_TOTAL,
            help: 'Total lab document analyses',
            labelNames: ['user_id', 'language'],
        }),
        makeCounterProvider({
            name: METRIC_LAB_INDEXING_TOTAL,
            help: 'Total lab indexing operations',
            labelNames: ['user_id'],
        }),
        makeCounterProvider({
            name: METRIC_LAB_CHAT_TOTAL,
            help: 'Total lab chat requests',
            labelNames: ['user_id', 'language'],
        }),
        makeHistogramProvider({
            name: METRIC_LAB_EMBEDDING_DURATION,
            help: 'Duration of embedding generation in ms',
            labelNames: ['operation'],
            buckets: [50, 100, 250, 500, 1000, 2000, 5000],
        }),
        makeCounterProvider({
            name: METRIC_LAB_CHUNKS_INDEXED,
            help: 'Total chunks indexed in lab',
            labelNames: ['user_id'],
        }),
        makeHistogramProvider({
            name: METRIC_LAB_SEARCH_DURATION,
            help: 'Qdrant vector search duration in ms',
            buckets: [5, 10, 25, 50, 100, 250, 500],
        }),
        makeHistogramProvider({
            name: METRIC_LAB_LLM_DURATION,
            help: 'Gemini LLM response duration in ms',
            buckets: [200, 500, 1000, 2000, 5000, 10000, 20000],
        }),
        makeHistogramProvider({
            name: METRIC_LAB_CHAT_TOTAL_DURATION,
            help: 'Total lab chat e2e duration in ms',
            buckets: [500, 1000, 2000, 5000, 10000, 20000, 30000],
        }),
        LabMetricsService,
        {
            provide: ANALYSIS_PORT,
            useClass: VertexAiAnalysisAdapter,
        },
        {
            provide: EPHEMERAL_USER_REPO_PORT,
            useClass: FirestoreEphemeralUserAdapter,
        },
        AnalyzeDocumentUseCase,
        ConfirmIndexUseCase,
        ChatWithUserKnowledgeUseCase,
        IdentityCleanupService,
        LabUsageService,
        LabRateLimitGuard,
    ],
    exports: [
        AnalyzeDocumentUseCase,
        ConfirmIndexUseCase,
        ChatWithUserKnowledgeUseCase,
        ANALYSIS_PORT,
        IdentityCleanupService,
        LabUsageService,
        LabRateLimitGuard,
        LabMetricsService,
    ],
})
export class LabModule { }
