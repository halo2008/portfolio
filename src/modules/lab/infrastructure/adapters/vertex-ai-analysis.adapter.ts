import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import {
    AnalysisPort,
    ChunkingStrategy,
    SemanticAnalysisResult,
    AnalysisResultChunk,
} from '../../domain/ports/analysis.port';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';

/**
 * VertexAiAnalysisAdapter
 * Explaining: Adapter for document analysis using Google Vertex AI (Gemini).
 * Implements language detection (PL/EN) and semantic chunking.
 * Includes retry logic for API resilience.
 */
@Injectable()
export class VertexAiAnalysisAdapter implements AnalysisPort {
    private readonly logger = new Logger(VertexAiAnalysisAdapter.name);
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 1000;

    constructor(
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
    ) { }

    /**
     * Analyze a document with automatic language detection.
     * Explaining: Routes to LLM or heuristic chunking based on strategy.
     * Detects if document is Polish or English and returns semantic chunks.
     */
    async analyzeDocument(
        content: string,
        filename: string,
        strategy: ChunkingStrategy = 'llm',
    ): Promise<SemanticAnalysisResult> {
        this.logger.log({ filename, strategy }, 'Analyzing document');

        if (strategy === 'heuristic') {
            return this.analyzeHeuristic(content);
        }

        const prompt = this.buildPrompt(content, filename);
        return this.executeWithRetry(() => this.callModel(prompt), filename);
    }

    /**
     * Heuristic document analysis.
     * Explaining: Rule-based splitting by headings, blank lines, and paragraphs.
     * Detects language using simple character/word heuristics.
     * Free and fast - no API calls, no token cost.
     */
    private analyzeHeuristic(content: string): SemanticAnalysisResult {
        const detectedLanguage = this.detectLanguageHeuristic(content);
        const chunks = this.splitHeuristic(content);

        this.logger.log({
            detectedLanguage,
            chunkCount: chunks.length,
            strategy: 'heuristic',
        }, 'Heuristic analysis completed');

        return { detectedLanguage, chunks, tokenCount: 0 };
    }

    /**
     * Detect language using character and word heuristics.
     */
    private detectLanguageHeuristic(text: string): 'pl' | 'en' {
        const lower = text.toLowerCase();
        const polishChars = /[ąćęłńóśźż]/;
        const polishWords = /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|tego|tym|dla|nie|tak)\b/;
        return (polishChars.test(lower) || polishWords.test(lower)) ? 'pl' : 'en';
    }

    /**
     * Split text into chunks using headings, blank lines, and size limits.
     * Explaining: Splits on markdown headings (# ...) and double newlines.
     * Merges small sections, splits oversized ones by sentences.
     */
    private splitHeuristic(content: string): AnalysisResultChunk[] {
        const lines = content.split('\n');
        const sections: { title: string; lines: string[]; startLine: number }[] = [];

        let currentTitle = '';
        let currentLines: string[] = [];
        let currentStart = 1;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const headingMatch = line.match(/^(#{1,3})\s+(.+)/);

            if (headingMatch) {
                // Save previous section
                if (currentLines.length > 0) {
                    sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
                }
                currentTitle = headingMatch[2].trim();
                currentLines = [];
                currentStart = i + 1;
                continue;
            }

            // Split on double blank lines (paragraph boundary)
            if (line.trim() === '' && currentLines.length > 0 && currentLines[currentLines.length - 1]?.trim() === '') {
                sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
                currentTitle = '';
                currentLines = [];
                currentStart = i + 2;
                continue;
            }

            currentLines.push(line);
        }

        // Push remaining
        if (currentLines.length > 0) {
            sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
        }

        // Merge small sections (< 100 chars) with next, split large ones (> 2000 chars)
        const MIN_CHUNK_CHARS = 100;
        const MAX_CHUNK_CHARS = 2000;
        const result: AnalysisResultChunk[] = [];
        let buffer: typeof sections[0] | null = null;

        for (const section of sections) {
            const text = section.lines.join('\n').trim();
            if (!text) continue;

            if (buffer) {
                const bufferText = buffer.lines.join('\n').trim();
                if (bufferText.length + text.length < MAX_CHUNK_CHARS) {
                    buffer.lines.push(...section.lines);
                    if (!buffer.title && section.title) buffer.title = section.title;
                    continue;
                }
                // Flush buffer
                this.pushChunk(result, buffer);
                buffer = null;
            }

            if (text.length < MIN_CHUNK_CHARS) {
                buffer = { ...section };
                continue;
            }

            if (text.length > MAX_CHUNK_CHARS) {
                // Split by sentences
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                let subChunk = '';
                let subStart = section.startLine;
                for (const sentence of sentences) {
                    if (subChunk.length + sentence.length > MAX_CHUNK_CHARS && subChunk.length > 0) {
                        result.push({
                            content: subChunk.trim(),
                            title: section.title || undefined,
                            startLine: subStart,
                            endLine: subStart + subChunk.split('\n').length - 1,
                        });
                        subStart += subChunk.split('\n').length;
                        subChunk = '';
                    }
                    subChunk += sentence;
                }
                if (subChunk.trim()) {
                    result.push({
                        content: subChunk.trim(),
                        title: section.title || undefined,
                        startLine: subStart,
                        endLine: section.startLine + section.lines.length - 1,
                    });
                }
                continue;
            }

            this.pushChunk(result, section);
        }

        // Flush remaining buffer
        if (buffer) {
            this.pushChunk(result, buffer);
        }

        // Generate titles for untitled chunks
        return result.map((chunk, i) => ({
            ...chunk,
            title: chunk.title || `Section ${i + 1}`,
        }));
    }

    private pushChunk(
        result: AnalysisResultChunk[],
        section: { title: string; lines: string[]; startLine: number },
    ): void {
        const text = section.lines.join('\n').trim();
        if (!text) return;
        result.push({
            content: text,
            title: section.title || undefined,
            startLine: section.startLine,
            endLine: section.startLine + section.lines.length - 1,
        });
    }

    /**
     * Build the analysis prompt.
     * Explaining: Creates prompt instructing model to detect language and extract chunks.
     */
    private buildPrompt(content: string, filename: string): string {
        return `Analyze the following document and extract semantic chunks.

Filename: ${filename}

Detect if document is in Polish or English. Return semantic chunks with detected language.

Document content:
${content}

Instructions:
1. Detect the primary language of the document (Polish or English)
2. Split the content into semantic chunks (logical sections)
3. For each chunk, provide:
   - A short descriptive title (in the same language as the document)
   - The chunk content
   - A brief rationale explaining why this section was chunked this way
   - Start line number (approximate)
   - End line number (approximate)

Return ONLY valid JSON matching the specified schema.`;
    }

    /**
     * Call Gemini model with structured output.
     * Explaining: Uses Gemini 3 Flash Preview with JSON schema for structured response.
     */
    private async callModel(
        prompt: string,
    ): Promise<SemanticAnalysisResult> {
        const response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detectedLanguage: {
                            type: Type.STRING,
                            enum: ['pl', 'en'],
                            description: 'Detected language code (pl or en)',
                        },
                        chunks: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    content: {
                                        type: Type.STRING,
                                        description: 'The semantic chunk content',
                                    },
                                    title: {
                                        type: Type.STRING,
                                        description: 'Short descriptive title for this chunk (in document language)',
                                    },
                                    rationale: {
                                        type: Type.STRING,
                                        description: 'Brief explanation of why this section was chunked this way',
                                    },
                                    startLine: {
                                        type: Type.INTEGER,
                                        description: 'Starting line number',
                                    },
                                    endLine: {
                                        type: Type.INTEGER,
                                        description: 'Ending line number',
                                    },
                                },
                                required: ['content', 'title', 'startLine', 'endLine'],
                            },
                        },
                    },
                    required: ['detectedLanguage', 'chunks'],
                },
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error('Empty response from Gemini model');
        }

        // Extract real token usage from Gemini API response
        const tokenCount = (response as any).usageMetadata?.totalTokenCount ?? 0;

        const parsed = JSON.parse(text) as Omit<SemanticAnalysisResult, 'tokenCount'>;

        // Log detected language for monitoring
        this.logger.log(
            {
                detectedLanguage: parsed.detectedLanguage,
                chunkCount: parsed.chunks.length,
                tokenCount,
            },
            'Document language detected',
        );

        return {
            ...parsed,
            tokenCount,
        };
    }

    /**
     * Execute function with retry logic.
     * Explaining: Retries up to MAX_RETRIES times with exponential backoff.
     */
    private async executeWithRetry<T>(
        fn: () => Promise<T>,
        filename: string,
    ): Promise<T> {
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;
                const isLastAttempt = attempt === this.MAX_RETRIES;

                this.logger.warn(
                    {
                        filename,
                        attempt,
                        maxRetries: this.MAX_RETRIES,
                        error: lastError.message,
                        isLastAttempt,
                    },
                    `Analysis attempt ${attempt} failed`,
                );

                if (!isLastAttempt) {
                    await this.delay(this.RETRY_DELAY_MS * attempt);
                }
            }
        }

        this.logger.error(
            {
                filename,
                totalAttempts: this.MAX_RETRIES,
                error: lastError?.message,
            },
            'All analysis attempts failed',
        );

        throw lastError;
    }

    /**
     * Delay helper for retry backoff.
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
