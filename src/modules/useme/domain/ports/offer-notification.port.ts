import { JobOffer } from '../entities/job-offer.entity';

export const OFFER_NOTIFICATION_PORT = 'UsemeOfferNotificationPort';

export interface OfferNotificationPort {
  notify(offer: JobOffer): Promise<void>;
}
