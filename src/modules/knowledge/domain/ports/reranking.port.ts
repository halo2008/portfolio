export const RERANKING_PORT = Symbol('RERANKING_PORT');

export interface SearchChunk {
    id: string | number;
    content: string;
    title?: string;
    category?: string;
    technologies?: string[];
    tags?: string[];
    /** Original vector similarity score (0-1) */
    vectorScore: number;
}

export interface RerankedChunk extends SearchChunk {
    /** LLM-assigned relevance score (0-10) */
    relevanceScore: number;
    /** Combined final score for ordering */
    finalScore: number;
}

export interface RerankingPort {
    /**
     * Reranks search results using LLM-based relevance scoring.
     * Returns top `topK` results ordered by relevance.
     */
    rerank(query: string, chunks: SearchChunk[], topK?: number): Promise<RerankedChunk[]>;
}
