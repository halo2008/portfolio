import { Injectable, Logger, Inject } from '@nestjs/common';
import { Firestore } from '@google-cloud/firestore';
import type { ProcessedOffersPort } from '../../domain/ports/processed-offers.port';

@Injectable()
export class FirestoreProcessedOffersAdapter implements ProcessedOffersPort {
  private readonly logger = new Logger(FirestoreProcessedOffersAdapter.name);
  private readonly collection: string = 'useme_processed_offers';

  constructor(
    @Inject('FIRESTORE_DB') private readonly db: Firestore,
  ) {}

  async wasAlreadyProcessed(externalId: string): Promise<boolean> {
    const doc = await this.db.collection(this.collection).doc(externalId).get();
    return doc.exists;
  }

  async markAsProcessed(externalId: string): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days TTL
    await this.db.collection(this.collection).doc(externalId).set({
      processedAt: now,
      expiresAt,
    });
  }
}
