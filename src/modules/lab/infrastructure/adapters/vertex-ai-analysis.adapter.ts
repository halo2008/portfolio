import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import {
    AnalysisPort,
    SemanticAnalysisResult,
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
     * Explaining: Sends content to Gemini model with structured output schema.
     * Detects if document is Polish or English and returns semantic chunks.
     */
    async analyzeDocument(
        content: string,
        filename: string,
    ): Promise<SemanticAnalysisResult> {
        const prompt = this.buildPrompt(content, filename);

        return this.executeWithRetry(() => this.callModel(prompt), filename);
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
   - The chunk content
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
                                    startLine: {
                                        type: Type.INTEGER,
                                        description: 'Starting line number',
                                    },
                                    endLine: {
                                        type: Type.INTEGER,
                                        description: 'Ending line number',
                                    },
                                },
                                required: ['content', 'startLine', 'endLine'],
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

        const result = JSON.parse(text) as SemanticAnalysisResult;

        // Log detected language for monitoring
        this.logger.log(
            {
                detectedLanguage: result.detectedLanguage,
                chunkCount: result.chunks.length,
            },
            'Document language detected',
        );

        return result;
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
