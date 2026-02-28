import { Module, Global } from '@nestjs/common';
import { QdrantProvider } from './qdrant.provider';

@Global() // Explaining: Marking as global to simplify access for multiple adapters (e.g. Chat, Ingestion).
@Module({
    providers: [QdrantProvider],
    exports: [QdrantProvider],
})
export class QdrantModule { }