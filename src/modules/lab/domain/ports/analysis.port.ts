export interface AnalysisResultChunk {
    content: string;
    title?: string;
    rationale?: string;
    suggestedTags?: string[];
    startLine: number;
    endLine: number;
}

export interface SemanticAnalysisResult {
    detectedLanguage: 'pl' | 'en';
    chunks: AnalysisResultChunk[];
    tokenCount: number;
}

/** 'llm' = Gemini AI chunking (costs tokens); 'heuristic' = rule-based splitting (free) */
export type ChunkingStrategy = 'llm' | 'heuristic';

/** Controls prompt specialization without separate adapters */
export type AnalysisContext = 'admin' | 'lab';

export const ANALYSIS_PORT = Symbol('ANALYSIS_PORT');

export interface AnalysisPort {
    analyzeDocument(
        content: string,
        filename: string,
        strategy?: ChunkingStrategy,
        context?: AnalysisContext,
    ): Promise<SemanticAnalysisResult>;
}
