import { Module } from '@nestjs/common';

// Application
import { ProcessNewOffersUseCase } from './application/use-cases/process-new-offers.use-case';

// Domain Ports
import { OFFER_SOURCE_PORT } from './domain/ports/offer-source.port';
import { OFFER_ANALYSIS_PORT } from './domain/ports/offer-analysis.port';
import { OFFER_NOTIFICATION_PORT } from './domain/ports/offer-notification.port';
import { PROCESSED_OFFERS_PORT } from './domain/ports/processed-offers.port';

// Infrastructure Adapters
import { GmailOfferSourceAdapter } from './infrastructure/adapters/gmail-offer-source.adapter';
import { GeminiOfferAnalysisAdapter } from './infrastructure/adapters/gemini-offer-analysis.adapter';
import { SlackOfferNotificationAdapter } from './infrastructure/adapters/slack-offer-notification.adapter';
import { FirestoreProcessedOffersAdapter } from './infrastructure/adapters/firestore-processed-offers.adapter';

// Infrastructure Delivery
import { UsemeController } from './infrastructure/delivery/useme.controller';

@Module({
  controllers: [UsemeController],
  providers: [
    // Adapters
    GmailOfferSourceAdapter,
    GeminiOfferAnalysisAdapter,
    SlackOfferNotificationAdapter,
    FirestoreProcessedOffersAdapter,

    // Port -> Adapter bindings
    { provide: OFFER_SOURCE_PORT, useClass: GmailOfferSourceAdapter },
    { provide: OFFER_ANALYSIS_PORT, useClass: GeminiOfferAnalysisAdapter },
    { provide: OFFER_NOTIFICATION_PORT, useClass: SlackOfferNotificationAdapter },
    { provide: PROCESSED_OFFERS_PORT, useClass: FirestoreProcessedOffersAdapter },

    // Use Case (manual DI to keep it clean of NestJS decorators)
    {
      provide: ProcessNewOffersUseCase,
      useFactory: (
        source: GmailOfferSourceAdapter,
        analysis: GeminiOfferAnalysisAdapter,
        notification: SlackOfferNotificationAdapter,
        processedOffers: FirestoreProcessedOffersAdapter,
      ) => new ProcessNewOffersUseCase(source, analysis, notification, processedOffers),
      inject: [
        GmailOfferSourceAdapter,
        GeminiOfferAnalysisAdapter,
        SlackOfferNotificationAdapter,
        FirestoreProcessedOffersAdapter,
      ],
    },
  ],
})
export class UsemeModule {}
