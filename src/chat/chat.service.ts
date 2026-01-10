// chat.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_CLIENT } from '../qdrant/qdrant.provider';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private genAI: GoogleGenAI;

    private readonly COLLECTION_NAME = 'portfolio_knowledge';

    constructor(
        @Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient,
    ) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('CRITICAL: GEMINI_API_KEY is missing.');
        } else {
            this.genAI = new GoogleGenAI({ apiKey });
        }
    }

    async generateResponse(userMessage: string): Promise<string> {
        if (!this.genAI) return "System Error: AI Brain not connected.";

        try {
            const embeddingResult = await this.genAI.models.embedContent({
                model: 'text-embedding-004',
                contents: userMessage,
            });
            const queryVector = embeddingResult.embeddings?.[0]?.values;

            if (!queryVector) {
                throw new Error("Failed to generate embedding");
            }
            const searchResults = await this.qdrantClient.search(this.COLLECTION_NAME, {
                vector: queryVector,
                limit: 3,
                with_payload: true,
            });
            const context = searchResults
                .map(res => res.payload?.content || '')
                .join('\n\n---\n\n');

            this.logger.log(`RAG Context found: ${searchResults.length} chunks`);

            const finalPrompt = `
      You are Konrad's AI Assistant. Use the context below to answer the user's question.
      If the answer is not in the context, say you don't know (or answer based on general knowledge if it's chit-chat).
      
      CONTEXT FROM KNOWLEDGE BASE:
      ${context}

      USER QUESTION:
      ${userMessage}
      `;

            const result = await this.genAI.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: finalPrompt,
            });

            return result.text || "I couldn't generate a response.";

        } catch (error) {
            this.logger.error("RAG Pipeline Error:", error);
            return "Something went wrong while accessing my memory.";
        }
    }
}