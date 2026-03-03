// Entities
export {
    EphemeralUser,
    EphemeralUserRole,
    createEphemeralUser,
    isExpired,
    toPersistence,
    fromPersistence,
} from './entities/ephemeral-user.entity';

// Ports
export {
    EPHEMERAL_USER_REPO_PORT,
    EphemeralUserRepoPort,
} from './ports/ephemeral-user-repo.port';
export {
    ANALYSIS_PORT,
    AnalysisPort,
    SemanticAnalysisResult,
    AnalysisResultChunk,
} from './ports/analysis.port';
export {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../knowledge/domain/ports/knowledge-repo.port';
export {
    EMBEDDING_PROVIDER_PORT,
    EmbeddingProviderPort,
} from '../../knowledge/domain/ports/embedding-provider.port';

// Application Services (DTOs)
export type {
    CleanupReport,
} from '../application/services/identity-cleanup.service';

// Value Objects
export {
    UserId,
    ExpirationTime,
    LanguageCode,
    SupportedLanguage,
} from './value-objects';
