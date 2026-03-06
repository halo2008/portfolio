export const PROCESSED_OFFERS_PORT = 'UsemeProcessedOffersPort';

export interface ProcessedOffersPort {
  wasAlreadyProcessed(externalId: string): Promise<boolean>;
  markAsProcessed(externalId: string): Promise<void>;
}
