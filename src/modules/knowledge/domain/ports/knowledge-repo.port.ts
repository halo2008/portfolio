export const KNOWLEDGE_REPO_PORT = Symbol('KNOWLEDGE_REPO_PORT');

/**
 * RAG Security Context
 * Explaining: Context required for strict context isolation in RAG queries.
 * Contains user identity and authorization metadata for zero-trust security.
 */
export interface RagSecurityContext {
    userId: string;
    role: string;
    language: string;
}

export interface KnowledgeFilter {
    category?: string;
    contentHash?: string;
    id?: string;
}

/**
 * Search context for dual-context RAG
 * Explaining: Determines which knowledge context to query - admin (public) or user (private).
 */
export type SearchContext =
    | { type: 'ADMIN' }
    | { type: 'USER'; userId: string };

export interface KnowledgeRepoPort {
    /**
     * Checks if identical content hash already exists.
     */
    checkDuplicate(hash: string): Promise<boolean>;

    /**
     * Upserts a list of formatted points into the vector database.
     */
    upsertPoints(points: any[]): Promise<void>;

    /**
     * Deletes knowledge by given filters.
     */
    deleteByFilter(filter: KnowledgeFilter): Promise<number>;

    /**
     * Retrieves counts for all knowledge categories.
     */
    getStats(): Promise<Record<string, number>>;

    /**
     * Search for knowledge in admin context (strictly ADMIN only).
     * Explaining: Used for main page chat queries - only searches public admin knowledge.
     * @param query - The search query/embedding vector
     * @param context - Security context for authorization
     * @throws ForbiddenException if context is missing or user is not admin
     */
    searchAdminKnowledge(query: number[], context: RagSecurityContext): Promise<string>;

    /**
     * Search for knowledge in user context (strictly user only).
     * Explaining: Used for lab chat queries - only searches knowledge belonging to the specific user.
     * @param query - The search query/embedding vector
     * @param userId - The user ID to filter by
     * @param context - Security context for authorization
     * @throws ForbiddenException if context is missing or role is demo without user match
     */
    searchUserKnowledge(query: number[], userId: string, context: RagSecurityContext, scoreThreshold?: number): Promise<string>;

    /**
     * Delete all knowledge points for a specific user.
     * Explaining: Used for cleanup of user-specific data.
     * @param userId - The user ID to delete knowledge for
     * @param context - Security context to ensure proper authorization
     * @throws ForbiddenException if context is missing or ambiguous
     */
    deleteByUserId(userId: string, context: RagSecurityContext): Promise<number>;

    /**
     * Count knowledge points based on context.
     * Explaining: Returns counts filtered by security context.
     * @param context - Security context for filtering
     * @throws ForbiddenException if context is missing or ambiguous
     */
    count(context: RagSecurityContext): Promise<number>;
}
