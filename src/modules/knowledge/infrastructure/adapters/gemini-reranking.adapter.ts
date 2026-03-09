import { Injectable, Logger, Inject } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import { RerankingPort, SearchChunk, RerankedChunk } from '../../domain/ports/reranking.port';
import { GOOGLE_GENAI } from '../../../../core/genai/genai.module';

@Injectable()
export class GeminiRerankingAdapter implements RerankingPort {
    private readonly logger = new Logger(GeminiRerankingAdapter.name);
    private readonly RERANK_MODEL = 'gemini-3-flash-preview';

    constructor(
        @Inject(GOOGLE_GENAI) private readonly ai: GoogleGenAI,
    ) { }

    async rerank(query: string, chunks: SearchChunk[], topK = 5): Promise<RerankedChunk[]> {
        if (chunks.length === 0) return [];

        // If fewer chunks than topK, still rerank for ordering but return all
        if (chunks.length <= 2) {
            return chunks.map(c => ({
                ...c,
                relevanceScore: c.vectorScore * 10,
                finalScore: c.vectorScore,
            }));
        }

        try {
            const scored = await this.scoreChunks(query, chunks);
            return scored
                .sort((a, b) => b.finalScore - a.finalScore)
                .slice(0, topK);
        } catch (error) {
            this.logger.warn(
                { error: (error as Error).message },
                'Reranking failed, falling back to vector score ordering',
            );
            // Graceful degradation: return original order by vector score
            return chunks
                .sort((a, b) => b.vectorScore - a.vectorScore)
                .slice(0, topK)
                .map(c => ({
                    ...c,
                    relevanceScore: c.vectorScore * 10,
                    finalScore: c.vectorScore,
                }));
        }
    }

    private async scoreChunks(query: string, chunks: SearchChunk[]): Promise<RerankedChunk[]> {
        const numberedChunks = chunks.map((chunk, i) => {
            const title = chunk.title ? `Title: ${chunk.title}\n` : '';
            return `[${i}] ${title}${chunk.content.slice(0, 500)}`;
        }).join('\n---\n');

        const prompt = `You are a relevance judge for a RAG system.

QUERY: "${query}"

CHUNKS:
${numberedChunks}

Rate each chunk's relevance to the QUERY on a scale of 0-10:
- 10: Directly and completely answers the query
- 7-9: Highly relevant, contains key information
- 4-6: Partially relevant, tangentially related
- 1-3: Minimally relevant
- 0: Completely irrelevant

Return ONLY a JSON array of scores in chunk order.`;

        const response = await this.ai.models.generateContent({
            model: this.RERANK_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scores: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                            description: 'Relevance scores (0-10) for each chunk in order',
                        },
                    },
                    required: ['scores'],
                },
                temperature: 0,
                maxOutputTokens: 256,
            },
        });

        const text = response.text;
        if (!text) {
            throw new Error('Empty reranking response');
        }

        const parsed = JSON.parse(text) as { scores: number[] };

        if (!parsed.scores || parsed.scores.length !== chunks.length) {
            throw new Error(`Score count mismatch: got ${parsed.scores?.length}, expected ${chunks.length}`);
        }

        this.logger.debug({
            query: query.slice(0, 80),
            scores: parsed.scores,
            chunkCount: chunks.length,
        }, 'Reranking scores computed');

        return chunks.map((chunk, i) => {
            const relevanceScore = Math.max(0, Math.min(10, parsed.scores[i]));
            // Combine: 60% LLM relevance, 40% vector similarity
            const finalScore = (relevanceScore / 10) * 0.6 + chunk.vectorScore * 0.4;

            return {
                ...chunk,
                relevanceScore,
                finalScore,
            };
        });
    }
}
