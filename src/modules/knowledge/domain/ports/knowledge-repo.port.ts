export const KNOWLEDGE_REPO_PORT = Symbol('KNOWLEDGE_REPO_PORT');

export interface KnowledgeFilter {
    category?: string;
    contentHash?: string;
    id?: string;
}

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
}
