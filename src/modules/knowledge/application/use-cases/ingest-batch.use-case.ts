import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeAtom } from '../../domain/entities/knowledge-atom.entity';
import { EMBEDDING_PROVIDER_PORT, EmbeddingProviderPort } from '../../domain/ports/embedding-provider.port';
import { KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../domain/ports/knowledge-repo.port';

export interface IngestionResult {
    inserted: number;
    duplicates: number;
    errors: number;
    ids: string[];
}

@Injectable()
export class IngestBatchUseCase {
    private readonly logger = new Logger(IngestBatchUseCase.name);

    constructor(
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort,
        @Inject(EMBEDDING_PROVIDER_PORT) private readonly embeddingProvider: EmbeddingProviderPort
    ) { }

    async execute(items: KnowledgeAtom[]): Promise<IngestionResult> {
        const result: IngestionResult = { inserted: 0, duplicates: 0, errors: 0, ids: [] };
        const allPoints: any[] = [];

        for (const item of items) {
            const hash = this.hashContent(item.text);
            const isDuplicate = await this.knowledgeRepo.checkDuplicate(hash);

            if (isDuplicate) {
                this.logger.warn(`Duplicate content detected, skipping: ${item.category}`);
                result.duplicates++;
                continue;
            }

            const chunks = this.chunkText(item.text, 500, 100);

            try {
                const embeddings = await this.embeddingProvider.generateEmbeddings(chunks);

                embeddings.forEach((vector, index) => {
                    const chunk = chunks[index];
                    const pointId = uuidv4();

                    allPoints.push({
                        id: pointId,
                        vector: vector,
                        payload: {
                            content: chunk,
                            category: item.category,
                            technologies: item.tags,
                            timestamp: new Date().toISOString(),
                            source: 'ingestion_batch',
                            contentHash: hash,
                        },
                    });
                    result.ids.push(pointId);
                });
            } catch (err) {
                this.logger.error(`Error processing category ${item.category}: ${err.message}`);
                result.errors++;
            }
        }

        if (allPoints.length > 0) {
            await this.knowledgeRepo.upsertPoints(allPoints);
            result.inserted = allPoints.length;
        }

        this.logger.log(`Ingestion complete: ${result.inserted} inserted, ${result.duplicates} skipped, ${result.errors} errors`);
        return result;
    }

    private hashContent(text: string): string {
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    private chunkText(text: string, size: number, overlap: number): string[] {
        const chunks = [];
        let i = 0;
        while (i < text.length) {
            chunks.push(text.slice(i, i + size));
            i += size - overlap;
        }
        return chunks;
    }
}
