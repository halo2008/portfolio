import { JobOffer } from '../entities/job-offer.entity';

export const OFFER_SOURCE_PORT = 'UsemeOfferSourcePort';

export interface OfferSourcePort {
  fetchNewOffers(): Promise<JobOffer[]>;
}
