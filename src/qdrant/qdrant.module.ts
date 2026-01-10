import { Module } from '@nestjs/common';
import { QdrantProvider } from './qdrant.provider';

@Module({
    providers: [QdrantProvider],
    exports: [QdrantProvider],
})
export class QdrantModule { }
