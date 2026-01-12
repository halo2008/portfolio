import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { QdrantModule } from '../qdrant/qdrant.module';
import { SlackModule } from '../slack/slack.module';

@Module({
    imports: [QdrantModule, SlackModule],
    controllers: [ChatController],
    providers: [ChatService],
})
export class ChatModule { }
