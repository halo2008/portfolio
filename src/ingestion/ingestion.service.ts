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
    
    private readonly CHUNK_SIZE = 500; 
    private readonly CHUNK_OVERLAP = 100; 

    constructor(@Inject(QDRANT_CLIENT) private readonly qdrantClient: QdrantClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            this.logger.error('GEMINI_API_KEY is missing via process.env');
            throw new Error('Gemini API Key missing');
        }
        this.genAI = new GoogleGenAI({ apiKey });
    }

    async processFile(file: Express.Multer.File) {
        if (!this.genAI) throw new Error('Gemini API Key missing');

        await this.ensureCollectionExists();

        const content = file.buffer.toString('utf-8');
        this.logger.log(`Processing file: ${file.originalname}, size: ${content.length}`);

        const chunks = this.chunkText(content, this.CHUNK_SIZE, this.CHUNK_OVERLAP);
        
        let upsertedCount = 0;

        for (const chunk of chunks) {
            try {
                const pointId = uuidv5(chunk, this.NAMESPACE_UUID);

                const embeddingResult = await this.genAI.models.embedContent({
                    model: 'text-embedding-004',
                    contents: chunk,
                });

                const vector = embeddingResult.embeddings?.[0]?.values;
                if (!vector) {
                    this.logger.warn(`Skipping chunk, no vector generated for: ${chunk.substring(0, 20)}...`);
                    continue;
                }

                await this.qdrantClient.upsert(this.COLLECTION_NAME, {
                    points: [
                        {
                            id: pointId,
                            vector: vector,
                            payload: {
                                content: chunk,
                                source: file.originalname,
                                type: 'document_fragment',
                                length: chunk.length,
                                timestamp: new Date().toISOString()
                            },
                        },
                    ],
                });
                upsertedCount++;
            } catch (e) {
                this.logger.error(`Failed to ingest chunk [${upsertedCount}]: ${chunk.substring(0, 30)}...`, e);
            }
        }

        return {
            status: 'Success',
            filename: file.originalname,
            chunksProcessed: upsertedCount,
            totalPoints: await this.getCollectionCount()
        };
    }

    private chunkText(text: string, chunkSize: number, overlap: number): string[] {
        if (chunkSize <= overlap) throw new Error('Chunk size must be larger than overlap');
        
        const chunks: string[] = [];
        let startIndex = 0;

        while (startIndex < text.length) {
            let endIndex = startIndex + chunkSize;
            
            if (endIndex < text.length) {
                const lastSpace = text.lastIndexOf(' ', endIndex);
                if (lastSpace > startIndex) {
                    endIndex = lastSpace;
                }
            }

            const chunk = text.slice(startIndex, endIndex).trim();
            if (chunk.length > 20) {
                chunks.push(chunk);
            }

            startIndex = endIndex - overlap;
            
            if (startIndex <= (endIndex - chunkSize)) {
                startIndex = endIndex; 
            }
        }

        return chunks;
    }

    private async ensureCollectionExists() {
        try {
            await this.qdrantClient.getCollection(this.COLLECTION_NAME);
        } catch (e) {
            this.logger.log(`Collection ${this.COLLECTION_NAME} not found. Creating with strict config...`);
            await this.qdrantClient.createCollection(this.COLLECTION_NAME, {
                vectors: {
                    size: 768,
                    distance: 'Cosine',
                },
                optimizers_config: {
                    default_segment_number: 2,
                }
            });
        }
    }

    private async getCollectionCount(): Promise<number> {
        try {
            const stats = await this.qdrantClient.getCollection(this.COLLECTION_NAME);
            return stats.points_count ?? 0;
        } catch (e) {
            this.logger.warn('Could not retrieve stats', e);
            return 0;
        }
    }
}