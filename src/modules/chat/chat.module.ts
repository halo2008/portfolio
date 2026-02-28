import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Application Layer
import { GenerateChatResponseUseCase } from './application/generate-chat-response.use-case';

// Infrastructure - Adapters
import { GeminiAiAdapter } from './infrastructure/adapters/gemini-ai.adapter';
import { FirestorePersistenceAdapter } from './infrastructure/adapters/firestore-persistence.adapter';
import { QdrantVectorDbAdapter } from './infrastructure/adapters/qdrant-vector-db.adapter';
import { SlackNotificationAdapter } from './infrastructure/adapters/slack-notification.adapter';

// Infrastructure - Delivery
import { ChatController } from './infrastructure/delivery/chat.controller';
import { ChatGateway } from './infrastructure/delivery/chat.gateway';

// External Modules (Global Infrastructure)
import { QdrantModule } from '../../modules/qdrant/qdrant.module';
import { SlackModule } from '../../modules/slack/slack.module';

@Module({
  imports: [
    HttpModule,
    QdrantModule, // Explaining: Provides access to the QdrantClient.
    forwardRef(() => SlackModule), // Explaining: Handles circular dependencies if Slack calls Chat back.
  ],
  controllers: [ChatController],
  providers: [
    // Explaining: We register all adapters as providers.
    GeminiAiAdapter,
    FirestorePersistenceAdapter,
    QdrantVectorDbAdapter,
    SlackNotificationAdapter,
    ChatGateway,
    
    // Explaining: Defining the UseCase with manual dependency injection.
    // This allows us to keep the UseCase class clean of NestJS decorators if we want to.
    {
      provide: GenerateChatResponseUseCase,
      useFactory: (
        ai: GeminiAiAdapter, 
        repo: FirestorePersistenceAdapter,
        vdb: QdrantVectorDbAdapter,
        note: SlackNotificationAdapter
      ) => {
        // Explaining: Constructing the UseCase with all 4 specialized adapters.
        return new GenerateChatResponseUseCase(ai, repo, vdb, note);
      },
      // Explaining: Declaring which providers should be injected into the factory.
      inject: [
        GeminiAiAdapter, 
        FirestorePersistenceAdapter, 
        QdrantVectorDbAdapter, 
        SlackNotificationAdapter
      ],
    },
  ],
  // Explaining: Exporting the UseCase in case other modules need to trigger chat logic.
  exports: [GenerateChatResponseUseCase],
})
export class ChatModule {}