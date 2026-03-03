import { Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { SecurityInterceptor } from './infrastructure/security/security.interceptor';
import { ANALYSIS_PORT } from './domain/ports/analysis.port';
import { VertexAiAnalysisAdapter } from './infrastructure/adapters/vertex-ai-analysis.adapter';
import { AnalyzeDocumentUseCase } from './application/use-cases/analyze-document.use-case';
import { ConfirmIndexUseCase } from './application/use-cases/confirm-index.use-case';
import { ChatWithUserKnowledgeUseCase } from './application/use-cases/chat-with-user-knowledge.use-case';
import { LabController } from './infrastructure/delivery/lab.controller';
import { CleanupController } from './infrastructure/delivery/cleanup.controller';
import { EPHEMERAL_USER_REPO_PORT } from './domain/ports/ephemeral-user-repo.port';
import { FirestoreEphemeralUserAdapter } from './infrastructure/adapters/firestore-ephemeral-user.adapter';
import { IdentityCleanupService } from './application/services/identity-cleanup.service';

/**
 * SecurityInterceptorProvider
 * Explaining: Registers SecurityInterceptor as a global APP_INTERCEPTOR
 * to apply zero-trust context injection to all /lab/* routes.
 */
const securityInterceptorProvider: Provider = {
    provide: APP_INTERCEPTOR,
    useClass: SecurityInterceptor,
};

/**
 * LabModule
 * Explaining: Module for Lab (demo) functionality including ephemeral users
 * and RAG query security context. Provides global security interceptor.
 */
@Module({
    imports: [KnowledgeModule],
    controllers: [LabController, CleanupController],
    providers: [
        // Global security interceptor for zero-trust context injection
        securityInterceptorProvider,
        // Analysis adapter -> Port binding
        {
            provide: ANALYSIS_PORT,
            useClass: VertexAiAnalysisAdapter,
        },
        // Ephemeral user repo adapter
        {
            provide: EPHEMERAL_USER_REPO_PORT,
            useClass: FirestoreEphemeralUserAdapter,
        },
        // Use cases
        AnalyzeDocumentUseCase,
        ConfirmIndexUseCase,
        ChatWithUserKnowledgeUseCase,
        // Services
        IdentityCleanupService,
    ],
    exports: [
        // Export use case for controllers
        AnalyzeDocumentUseCase,
        ConfirmIndexUseCase,
        ChatWithUserKnowledgeUseCase,
        // Export service for scheduling/cron jobs
        IdentityCleanupService,
    ],
})
export class LabModule { }
