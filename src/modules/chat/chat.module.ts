import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GenerateChatResponseUseCase } from './application/generate-chat-response.use-case';
import { RelayHumanResponseUseCase } from './application/relay-human-response.use-case';
import { ChatWithAdminKnowledgeUseCase } from './application/use-cases/chat-with-admin-knowledge.use-case';
import { ChatWithUserKnowledgeUseCase } from '../lab/application/use-cases/chat-with-user-knowledge.use-case';
import { TELEMETRY_PORT } from './domain/ports/telemetry.port';

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

import { ChatController } from './infrastructure/delivery/chat.controller';
import { ChatGateway } from './infrastructure/delivery/chat.gateway';

import { QdrantModule } from '../../modules/qdrant/qdrant.module';
import { SlackModule } from '../../modules/slack/slack.module';
import { KnowledgeModule } from '../../modules/knowledge/knowledge.module';
import { LabModule } from '../../modules/lab/lab.module';

import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { KNOWLEDGE_REPO_PORT } from '../knowledge/domain/ports/knowledge-repo.port';
import { RERANKING_PORT } from '../knowledge/domain/ports/reranking.port';
import { GOOGLE_GENAI } from '../../core/genai/genai.module';
import { AdminSettingsService } from '../knowledge/application/services/admin-settings.service';

@Module({
  imports: [
    HttpModule,
    QdrantModule,
    forwardRef(() => SlackModule),
    KnowledgeModule,
    LabModule,
  ],
  controllers: [ChatController],
  providers: [
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

    GeminiAiAdapter,
    FirestorePersistenceAdapter,
    QdrantVectorDbAdapter,
    SlackNotificationAdapter,
    {
      provide: TELEMETRY_PORT,
      useClass: PrometheusTelemetryAdapter,
    },
    ChatGateway,

    {
      provide: GenerateChatResponseUseCase,
      useFactory: (
        ai: GeminiAiAdapter,
        repo: FirestorePersistenceAdapter,
        vdb: QdrantVectorDbAdapter,
        note: SlackNotificationAdapter,
        telemetry: PrometheusTelemetryAdapter
      ) => {
        return new GenerateChatResponseUseCase(ai, repo, vdb, note, telemetry);
      },
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
      useFactory: (knowledgeRepo: any, ai: any, adminSettings: AdminSettingsService, reranker: any) => {
        return new ChatWithAdminKnowledgeUseCase(knowledgeRepo, ai, adminSettings, reranker);
      },
      inject: [KNOWLEDGE_REPO_PORT, GOOGLE_GENAI, AdminSettingsService, RERANKING_PORT],
    },
    ChatWithUserKnowledgeUseCase,
  ],
  exports: [GenerateChatResponseUseCase, RelayHumanResponseUseCase, ChatWithAdminKnowledgeUseCase, GeminiAiAdapter, FirestorePersistenceAdapter, QdrantVectorDbAdapter],
})
export class ChatModule { }