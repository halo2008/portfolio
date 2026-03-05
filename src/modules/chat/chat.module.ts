import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

// Application Layer
import { GenerateChatResponseUseCase } from './application/generate-chat-response.use-case';
import { RelayHumanResponseUseCase } from './application/relay-human-response.use-case';
import { ChatWithAdminKnowledgeUseCase } from './application/use-cases/chat-with-admin-knowledge.use-case';
import { ChatWithUserKnowledgeUseCase } from '../lab/application/use-cases/chat-with-user-knowledge.use-case';
import { TELEMETRY_PORT } from './domain/ports/telemetry.port';

// Infrastructure - Adapters
import { GeminiAiAdapter } from './infrastructure/adapters/gemini-ai.adapter';
import { FirestorePersistenceAdapter } from './infrastructure/adapters/firestore-persistence.adapter';
import { QdrantVectorDbAdapter } from './infrastructure/adapters/qdrant-vector-db.adapter';
import { SlackNotificationAdapter } from './infrastructure/adapters/slack-notification.adapter';
import {
  PrometheusTelemetryAdapter,
  METRIC_LLM_LATENCY,
  METRIC_VECTOR_SEARCH_LATENCY,
  METRIC_LLM_REQUESTS,
  METRIC_ACTIVE_WEBSOCKETS
} from './infrastructure/adapters/prometheus-telemetry.adapter';

// Infrastructure - Delivery
import { ChatController } from './infrastructure/delivery/chat.controller';
import { ChatGateway } from './infrastructure/delivery/chat.gateway';

// External Modules (Global Infrastructure)
import { QdrantModule } from '../../modules/qdrant/qdrant.module';
import { SlackModule } from '../../modules/slack/slack.module';
import { KnowledgeModule } from '../../modules/knowledge/knowledge.module';
import { LabModule } from '../../modules/lab/lab.module';

import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { KNOWLEDGE_REPO_PORT } from '../knowledge/domain/ports/knowledge-repo.port';

@Module({
  imports: [
    HttpModule,
    QdrantModule, // Explaining: Provides access to the QdrantClient.
    forwardRef(() => SlackModule), // Explaining: Handles circular dependencies if Slack calls Chat back.
    KnowledgeModule, // Explaining: Provides KNOWLEDGE_REPO_PORT for admin knowledge search.
    LabModule, // Explaining: Provides ChatWithUserKnowledgeUseCase for lab chat endpoint.
  ],
  controllers: [ChatController],
  providers: [
    // Prometheus Metrics Providers
    makeHistogramProvider({
      name: METRIC_LLM_LATENCY,
      help: 'Duration of LLM response generation in milliseconds',
      buckets: [500, 1000, 2000, 5000, 10000, 20000, 30000, 60000],
    }),
    makeHistogramProvider({
      name: METRIC_VECTOR_SEARCH_LATENCY,
      help: 'Duration of Vector Search in milliseconds',
      buckets: [10, 50, 100, 200, 500, 1000, 2000],
    }),
    makeCounterProvider({
      name: METRIC_LLM_REQUESTS,
      help: 'Total number of LLM response generation requests',
    }),
    makeGaugeProvider({
      name: METRIC_ACTIVE_WEBSOCKETS,
      help: 'Number of active WebSocket connections',
    }),

    // Explaining: We register all adapters as providers.
    GeminiAiAdapter,
    FirestorePersistenceAdapter,
    QdrantVectorDbAdapter,
    SlackNotificationAdapter,
    {
      provide: TELEMETRY_PORT,
      useClass: PrometheusTelemetryAdapter,
    },
    ChatGateway,

    // Explaining: Defining the UseCase with manual dependency injection.
    // This allows us to keep the UseCase class clean of NestJS decorators if we want to.
    {
      provide: GenerateChatResponseUseCase,
      useFactory: (
        ai: GeminiAiAdapter,
        repo: FirestorePersistenceAdapter,
        vdb: QdrantVectorDbAdapter,
        note: SlackNotificationAdapter,
        telemetry: PrometheusTelemetryAdapter
      ) => {
        // Explaining: Constructing the UseCase with all specialized adapters.
        return new GenerateChatResponseUseCase(ai, repo, vdb, note, telemetry);
      },
      // Explaining: Declaring which providers should be injected into the factory.
      inject: [
        GeminiAiAdapter,
        FirestorePersistenceAdapter,
        QdrantVectorDbAdapter,
        SlackNotificationAdapter,
        TELEMETRY_PORT
      ],
    },
    {
      provide: RelayHumanResponseUseCase,
      useFactory: (
        repo: FirestorePersistenceAdapter,
        gateway: ChatGateway
      ) => {
        return new RelayHumanResponseUseCase(repo, gateway);
      },
      inject: [FirestorePersistenceAdapter, ChatGateway],
    },
    {
      provide: ChatWithAdminKnowledgeUseCase,
      useFactory: (knowledgeRepo: any) => {
        return new ChatWithAdminKnowledgeUseCase(knowledgeRepo);
      },
      inject: [KNOWLEDGE_REPO_PORT],
    },
    // ChatWithUserKnowledgeUseCase is provided by LabModule, re-exported for use in ChatController
    ChatWithUserKnowledgeUseCase,
  ],
  // Explaining: Exporting the UseCase in case other modules need to trigger chat logic.
  exports: [GenerateChatResponseUseCase, RelayHumanResponseUseCase, ChatWithAdminKnowledgeUseCase, GeminiAiAdapter, FirestorePersistenceAdapter, QdrantVectorDbAdapter],
})
export class ChatModule { }