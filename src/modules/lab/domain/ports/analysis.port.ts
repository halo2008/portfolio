/**
 * AnalysisResultChunk
 * Explaining: A single semantic chunk from document analysis.
 */
export interface AnalysisResultChunk {
    content: string;
    title?: string;
    rationale?: string;
    startLine: number;
    endLine: number;
}

/**
 * SemanticAnalysisResult
 * Explaining: Structured result from document analysis including
 * detected language, semantic chunks, and token usage.
 */
export interface SemanticAnalysisResult {
    detectedLanguage: 'pl' | 'en';
    chunks: AnalysisResultChunk[];
    tokenCount: number;
}

/**
 * Chunking strategy for document analysis.
 * Explaining: Determines how the document is split into semantic chunks.
 * - 'llm': Uses Gemini AI for intelligent semantic chunking (higher quality, costs tokens)
 * - 'heuristic': Uses rule-based splitting by headings/paragraphs (free, fast)
 */
export type ChunkingStrategy = 'llm' | 'heuristic';

/**
 * Injection token for AnalysisPort.
 * Explaining: Used by NestJS dependency injection for hexagonal architecture.
 */
export const ANALYSIS_PORT = Symbol('ANALYSIS_PORT');

/**
 * AnalysisPort
 * Explaining: Port interface for document analysis with language detection.
 * Follows hexagonal architecture - domain defines the contract,
 * infrastructure adapters provide the implementation.
 */
export interface AnalysisPort {
    /**
     * Analyze a document and detect its language.
     * Explaining: Sends document content to AI model for semantic analysis
     * with automatic Polish/English language detection.
     * @param content The document content to analyze
     * @param filename The filename for context
     * @param strategy Chunking strategy: 'llm' (AI) or 'heuristic' (rule-based)
     * @returns Promise with detected language and semantic chunks
     */
    analyzeDocument(
        content: string,
        filename: string,
        strategy?: ChunkingStrategy,
    ): Promise<SemanticAnalysisResult>;
}
