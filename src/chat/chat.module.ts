import { Module, forwardRef } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { QdrantModule } from '../qdrant/qdrant.module';
import { SlackModule } from '../slack/slack.module';
import { ChatGateway } from './chat.gateway';
import { ConversationStateService } from './conversation-state.service';
import { FirestoreProvider } from '../firestore/firestore.provider';

import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [QdrantModule, forwardRef(() => SlackModule), HttpModule],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway, ConversationStateService, FirestoreProvider],
    exports: [ChatGateway, ConversationStateService],
})
export class ChatModule { }
