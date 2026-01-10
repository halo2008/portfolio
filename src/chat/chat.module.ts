import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { QdrantModule } from '../qdrant/qdrant.module';

@Module({
    imports: [QdrantModule],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule { }
