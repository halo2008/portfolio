import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_CLIENT } from '../qdrant/qdrant.provider';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);
    private genAI: GoogleGenAI;

    private readonly COLLECTION_NAME = 'portfolio'; 

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
                this.logger.error('Embedding failed', embeddingResult);
                throw new Error("Failed to generate embedding");
            }

            const searchResults = await this.qdrantClient.search(this.COLLECTION_NAME, {
                vector: queryVector,
                limit: 3,
                with_payload: true,
            });

            this.logger.log(`RAG: Found ${searchResults.length} relevant chunks in collection '${this.COLLECTION_NAME}'`);

            const context = searchResults
                .map(res => res.payload?.content || '')
                .join('\n\n---\n\n');

            const finalPrompt = `
            Jesteś wirtualnym asystentem Konrada Sędkowskiego.
            Twoim celem jest profesjonalne reprezentowanie Konrada przed rekruterami i klientami B2B.
            
            ZASADY OSOBOWOŚCI:
            1. Bądź szczery: Nie zmyślaj doświadczenia w AWS, skupiaj się na GCP.
            2. Styl: Konkretny, inżynierski, krótki i na temat.
            3. Call to Action: Jeśli ktoś pyta o współpracę, zachęcaj do kontaktu mailowego lub na LinkedIn.

            KONTEKST Z BAZY WIEDZY:
            ${context || 'Brak informacji w bazie.'}

            PYTANIE UŻYTKOWNIKA:
            ${userMessage}
            `;

            const result = await this.genAI.models.generateContent({
                model: 'gemini-3-flash-preview', 
                contents: finalPrompt,
            });

            return result.text || "I couldn't generate a response.";

        } catch (error) {
            this.logger.error("RAG Pipeline Error detailed:", error);
            return "Something went wrong while accessing my memory.";
        }
    }
}