import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import {
    AnalysisPort,
    AnalysisContext,
    ChunkingStrategy,
    SemanticAnalysisResult,
    AnalysisResultChunk,
} from '../../domain/ports/analysis.port';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';

@Injectable()
export class VertexAiAnalysisAdapter implements AnalysisPort {
    private readonly logger = new Logger(VertexAiAnalysisAdapter.name);
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY_MS = 1000;

    constructor(
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
    ) { }

    async analyzeDocument(
        content: string,
        filename: string,
        strategy: ChunkingStrategy = 'llm',
        context: AnalysisContext = 'lab',
    ): Promise<SemanticAnalysisResult> {
        this.logger.log({ filename, strategy, context }, 'Analyzing document');

        if (strategy === 'heuristic') {
            return this.analyzeHeuristic(content);
        }

        const prompt = this.buildPrompt(content, filename, context);
        return this.executeWithRetry(() => this.callModel(prompt), filename);
    }

    /** Rule-based splitting - no API calls, no token cost */
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

    private detectLanguageHeuristic(text: string): 'pl' | 'en' {
        const lower = text.toLowerCase();
        const polishChars = /[ąćęłńóśźż]/;
        const polishWords = /\b(jak|co|gdzie|kiedy|dlaczego|czy|jest|są|tego|tym|dla|nie|tak)\b/;
        return (polishChars.test(lower) || polishWords.test(lower)) ? 'pl' : 'en';
    }

    /** Splits on markdown headings and double newlines; merges small sections, splits oversized ones */
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
                if (currentLines.length > 0) {
                    sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
                }
                currentTitle = headingMatch[2].trim();
                currentLines = [];
                currentStart = i + 1;
                continue;
            }

            if (line.trim() === '' && currentLines.length > 0 && currentLines[currentLines.length - 1]?.trim() === '') {
                sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
                currentTitle = '';
                currentLines = [];
                currentStart = i + 2;
                continue;
            }

            currentLines.push(line);
        }

        if (currentLines.length > 0) {
            sections.push({ title: currentTitle, lines: currentLines, startLine: currentStart });
        }

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
                this.pushChunk(result, buffer);
                buffer = null;
            }

            if (text.length < MIN_CHUNK_CHARS) {
                buffer = { ...section };
                continue;
            }

            if (text.length > MAX_CHUNK_CHARS) {
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

        if (buffer) {
            this.pushChunk(result, buffer);
        }

        // Cap to prevent abuse with crafted documents
        const MAX_HEURISTIC_CHUNKS = 50;
        const capped = result.slice(0, MAX_HEURISTIC_CHUNKS);

        return capped.map((chunk, i) => ({
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

    private buildPrompt(content: string, filename: string, context: AnalysisContext): string {
        const domainHint = context === 'admin'
            ? `
Domain: This is a personal portfolio / professional knowledge base. The content describes experience, projects, skills, and technical decisions of a specific person.
- Use first-person references where appropriate (e.g. "Konrad uses Terraform for IaC")
- Categorize into: Strategy & Philosophy, Cloud & DevOps, AI & RAG Engineering, Industrial IoT & Experience
- Questions should mirror recruiter/client intent (e.g. "What cloud technologies does Konrad use?")`
            : `
Domain: This is a general-purpose document uploaded by a user. The content can be anything: documentation, notes, articles, specifications, reports, etc.
- Do NOT assume any specific person or project unless explicitly mentioned in the text
- Derive categories and topics from the actual content
- Questions should mirror what a reader of this document would naturally ask`;

        return `Role: Act as a Senior Knowledge Engineer and RAG Optimization Specialist.

Objective: Deconstruct the provided raw input and reconstruct it into high-fidelity, Self-Contained QA Atoms optimized for semantic retrieval in a Qdrant-based RAG system.

Filename: ${filename}
${domainHint}

Raw input:
${content}

The Problem to Solve:
Raw text often lacks clear intent boundaries, leading to fragmented chunks that return low-quality context. Transform this into "Self-Contained QA Atoms" where each chunk is an independent unit of knowledge.

Transformation Requirements:

1. LANGUAGE DETECTION: Detect the primary language of the document (Polish='pl' or English='en').

2. GRANULAR QA PAIRING: Convert raw descriptions into specific Question-Answer pairs.
   - The "title" field = a natural question that mirrors potential user intent
   - The "content" field = a complete, self-contained answer

3. CONTEXTUAL SELF-CONTAINMENT: Each answer MUST be fully understandable on its own.
   - NEVER use relative pronouns like "it," "they," "as mentioned before"
   - ALWAYS use specific nouns and full names from the document
   - Include enough context so the answer makes sense without seeing the original document

4. CHUNKING LOGIC:
   - Maximum 1000 characters per QA pair content
   - Group related facts together (e.g. a topic with its details and outcomes)
   - One chunk should answer one specific question or closely related set of questions
   - Avoid splitting mid-thought

5. SUGGESTED TAGS: For each chunk, suggest 2-5 topic keywords relevant to the content

6. RATIONALE: Brief explanation of why this chunk was created and what questions it answers

7. LINE NUMBERS: Approximate start and end line numbers from the original document

Return ONLY valid JSON matching the specified schema.`;
    }

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
                                        description: 'The semantic chunk content, self-contained and readable standalone',
                                    },
                                    title: {
                                        type: Type.STRING,
                                        description: 'Short descriptive title for this chunk (in document language)',
                                    },
                                    rationale: {
                                        type: Type.STRING,
                                        description: 'Brief explanation of why this section was chunked this way',
                                    },
                                    suggestedTags: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING },
                                        description: 'Suggested technology/topic tags for this chunk (2-5 keywords)',
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
                                required: ['content', 'title', 'suggestedTags', 'startLine', 'endLine'],
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

        const tokenCount = (response as any).usageMetadata?.totalTokenCount ?? 0;

        const parsed = JSON.parse(text) as Omit<SemanticAnalysisResult, 'tokenCount'>;

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

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
