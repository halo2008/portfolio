import { Logger } from '@nestjs/common';
import type { OfferSourcePort } from '../../domain/ports/offer-source.port';
import type { OfferAnalysisPort } from '../../domain/ports/offer-analysis.port';
import type { OfferNotificationPort } from '../../domain/ports/offer-notification.port';
import type { ProcessedOffersPort } from '../../domain/ports/processed-offers.port';

const SCORE_THRESHOLD = 50;

export interface ProcessResult {
  totalFetched: number;
  analyzed: number;
  notified: number;
  skipped: number;
  errors: number;
}

export class ProcessNewOffersUseCase {
  private readonly logger = new Logger(ProcessNewOffersUseCase.name);

  constructor(
    private readonly source: OfferSourcePort,
    private readonly analysis: OfferAnalysisPort,
    private readonly notification: OfferNotificationPort,
    private readonly processedOffers: ProcessedOffersPort,
  ) {}

  async execute(): Promise<ProcessResult> {
    const result: ProcessResult = {
      totalFetched: 0,
      analyzed: 0,
      notified: 0,
      skipped: 0,
      errors: 0,
    };

    const offers = await this.source.fetchNewOffers();
    result.totalFetched = offers.length;
    this.logger.log(`Fetched ${offers.length} offers from source`);

    for (const offer of offers) {
      try {
        const alreadyProcessed = await this.processedOffers.wasAlreadyProcessed(
          offer.externalId,
        );
        if (alreadyProcessed) {
          result.skipped++;
          continue;
        }

        const analysis = await this.analysis.analyzeOffer(offer);
        offer.attachAnalysis(analysis);
        result.analyzed++;

        await this.processedOffers.markAsProcessed(offer.externalId);

        if (offer.isWorthNotifying(SCORE_THRESHOLD)) {
          await this.notification.notify(offer);
          offer.markAsNotified();
          result.notified++;
          this.logger.log(
            `Notified: "${offer.title}" (score: ${analysis.score.value})`,
          );
        } else {
          this.logger.log(
            `Below threshold: "${offer.title}" (score: ${analysis.score.value})`,
          );
        }
      } catch (error) {
        result.errors++;
        this.logger.error(
          `Failed to process offer ${offer.externalId}: ${(error as Error).message}`,
        );
      }
    }

    this.logger.log(
      `Done: ${result.analyzed} analyzed, ${result.notified} notified, ${result.skipped} skipped, ${result.errors} errors`,
    );
    return result;
  }
}
