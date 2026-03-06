import { AnalysisResult, JobOffer } from '../entities/job-offer.entity';

export const OFFER_ANALYSIS_PORT = 'UsemeOfferAnalysisPort';

export interface OfferAnalysisPort {
  analyzeOffer(offer: JobOffer): Promise<AnalysisResult>;
}
