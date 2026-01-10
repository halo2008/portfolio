import { Inject, Injectable, Logger } from '@nestjs/common';
import { QDRANT_CLIENT } from '../qdrant/qdrant.provider';
import { QdrantClient } from '@qdrant/js-client-rest';
import { GoogleGenAI } from '@google/genai';
import { v5 as uuidv5 } from 'uuid';

@Injectable()
export class IngestionService {
    private readonly logger = new Logger(IngestionService.name);
    private genAI: GoogleGenAI;
    private readonly COLLECTION_NAME = 'portfolio';
    private readonly NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) this.genAI = new GoogleGenAI({ apiKey });
    }

    async processFile(file: Express.Multer.File) {
        if (!this.genAI) throw new Error('Gemini API Key missing');

        const content = file.buffer.toString('utf-8');
        this.logger.log(`Processing file: ${file.originalname}, size: ${content.length}`);

        const chunks = content
            .split(/^#+\s/gm)
            .map(chunk => chunk.trim())
            .filter(chunk => chunk.length > 20);

        let upsertedCount = 0;

        for (const chunk of chunks) {
            try {
                const pointId = uuidv5(chunk, this.NAMESPACE_UUID);

                const embeddingResult = await this.genAI.models.embedContent({
                    model: 'text-embedding-004',
                    contents: chunk,
                });

                const vector = embeddingResult.embeddings?.[0]?.values;
                if (!vector) throw new Error('No embedding generated');

                await this.qdrantClient.upsert(this.COLLECTION_NAME, {
                    points: [
                        {
                            id: pointId,
                            vector: vector,
                            payload: {
                                content: chunk,
                                source: file.originalname,
                                timestamp: new Date().toISOString()
                            },
                        },
                    ],
                });
                upsertedCount++;
            } catch (e) {
                this.logger.error(`Failed to ingest chunk: ${chunk.substring(0, 20)}...`, e);
            }
        }

        const stats = await this.qdrantClient.getCollection(this.COLLECTION_NAME);

        return {
            status: 'Success',
            filename: file.originalname,
            chunksProcessed: upsertedCount,
            totalPointsInDb: stats.points_count
        };
    }
}