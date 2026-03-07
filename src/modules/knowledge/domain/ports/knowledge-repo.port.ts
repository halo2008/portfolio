export const KNOWLEDGE_REPO_PORT = Symbol('KNOWLEDGE_REPO_PORT');

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

export type SearchContext =
    | { type: 'ADMIN' }
    | { type: 'USER'; userId: string };

export interface KnowledgePoint {
    id: string;
    title?: string;
    content: string;
    category?: string;
    technologies?: string[];
    language?: string;
    createdAt?: string;
}

export interface KnowledgeRepoPort {
    checkDuplicate(hash: string): Promise<boolean>;
    upsertPoints(points: any[]): Promise<void>;
    deleteByFilter(filter: KnowledgeFilter): Promise<number>;
    getStats(): Promise<Record<string, number>>;

    /** Browse admin knowledge points with pagination. */
    browsePoints(category?: string, limit?: number, offset?: string): Promise<{ points: KnowledgePoint[]; nextOffset?: string }>;

    /** Searches strictly admin-only vectors. */
    searchAdminKnowledge(query: number[], context: RagSecurityContext): Promise<string>;

    /** Searches strictly user-owned vectors (isolated by userId). */
    searchUserKnowledge(query: number[], userId: string, context: RagSecurityContext, scoreThreshold?: number, chunkingStrategy?: 'llm' | 'heuristic' | 'all'): Promise<string>;

    deleteByUserId(userId: string, context: RagSecurityContext): Promise<number>;
    count(context: RagSecurityContext): Promise<number>;
}
