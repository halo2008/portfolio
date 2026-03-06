import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { FIRESTORE_DB } from '../../../../core/firestore/firestore.provider';

export interface LabUsageStats {
    requestCount: number;
    analysisTokens: number;
    indexingOps: number;
    chatTokens: number;
}

/**
 * LabUsageService
 * Explaining: Service to track token usage and enforce rate limits for Lab sessions.
 * Persists data to Firestore using atomic increments to prevent race conditions.
 */
@Injectable()
export class LabUsageService {
    private readonly logger = new Logger(LabUsageService.name);
    private readonly COLLECTION_NAME = 'lab_usage';

    // Configurable rate limit per session (default 50)
    public readonly MAX_REQUESTS_PER_SESSION = 50;

    constructor(
        @Inject(FIRESTORE_DB) private readonly firestore: Firestore,
    ) { }

    /**
     * Get current usage statistics for a user session.
     * Explaining: Retrieves the aggregated usage data. If no data exists, returns zeros.
     */
    async getUsageStats(userId: string): Promise<LabUsageStats> {
        try {
            const doc = await this.firestore.collection(this.COLLECTION_NAME).doc(userId).get();
            if (!doc.exists) {
                return {
                    requestCount: 0,
                    analysisTokens: 0,
                    indexingOps: 0,
                    chatTokens: 0,
                };
            }
            const data = doc.data() as LabUsageStats;
            return {
                requestCount: data.requestCount || 0,
                analysisTokens: data.analysisTokens || 0,
                indexingOps: data.indexingOps || 0,
                chatTokens: data.chatTokens || 0,
            };
        } catch (error) {
            this.logger.error({ userId, error: (error as Error).message }, 'Failed to get usage stats');
            throw error;
        }
    }

    /**
     * Check if the user has exceeded their request limit.
     * Explaining: Compares current request count against MAX_REQUESTS_PER_SESSION.
     */
    async isRateLimited(userId: string): Promise<boolean> {
        const stats = await this.getUsageStats(userId);
        return stats.requestCount >= this.MAX_REQUESTS_PER_SESSION;
    }

    /**
     * Record usage for document analysis.
     * Explaining: Atomically increments request count and analysis tokens.
     */
    async recordAnalysis(userId: string, tokens: number): Promise<void> {
        await this.incrementUsage(userId, {
            requestCount: 1,
            analysisTokens: tokens,
        });
    }

    /**
     * Record usage for document indexing (Qdrant).
     * Explaining: Atomically increments request count and indexing ops.
     */
    async recordIndexing(userId: string, opsCount: number): Promise<void> {
        await this.incrementUsage(userId, {
            requestCount: 1,
            indexingOps: opsCount,
        });
    }

    /**
     * Record usage for chat interaction.
     * Explaining: Atomically increments request count and chat tokens.
     */
    async recordChat(userId: string, tokens: number): Promise<void> {
        await this.incrementUsage(userId, {
            requestCount: 1,
            chatTokens: tokens,
        });
    }

    /**
     * Clean up usage data for a user.
     * Explaining: Called when the ephemeral user session expires.
     */
    async cleanupUserData(userId: string): Promise<void> {
        try {
            await this.firestore.collection(this.COLLECTION_NAME).doc(userId).delete();
            this.logger.debug({ userId }, 'Cleaned up usage data');
        } catch (error) {
            this.logger.error({ userId, error: (error as Error).message }, 'Failed to cleanup usage data');
        }
    }

    /**
     * Get the real expiresAt timestamp from ephemeral_users collection.
     * Returns the stored value instead of always computing now+24h.
     */
    async getSessionExpiresAt(userId: string): Promise<string> {
        try {
            const doc = await this.firestore.collection('ephemeral_users').doc(userId).get();
            if (doc.exists) {
                const data = doc.data();
                if (data?.expiresAt) {
                    const expiresAt = data.expiresAt.toDate
                        ? data.expiresAt.toDate()
                        : new Date(data.expiresAt);
                    return expiresAt.toISOString();
                }
            }
        } catch (error) {
            this.logger.error({ userId, error: (error as Error).message }, 'Failed to get session expiresAt');
        }
        // Fallback: 24h from now (first visit, no doc yet)
        return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    }

    /**
     * Update preferred language in ephemeral_users collection.
     * Does NOT overwrite expiresAt or createdAt - only sets preferredLanguage.
     */
    async updateLanguagePreference(userId: string, language: 'pl' | 'en'): Promise<void> {
        try {
            await this.firestore.collection('ephemeral_users').doc(userId).set(
                {
                    uid: userId,
                    preferredLanguage: language,
                    role: 'demo',
                },
                { merge: true },
            );
            this.logger.debug({ userId, language }, 'Updated language preference');
        } catch (error) {
            this.logger.error(
                { userId, error: (error as Error).message },
                'Failed to update language preference',
            );
        }
    }

    private async incrementUsage(userId: string, increments: Partial<LabUsageStats>): Promise<void> {
        try {
            const updates: Record<string, any> = {};
            if (increments.requestCount !== undefined) updates.requestCount = FieldValue.increment(increments.requestCount);
            if (increments.analysisTokens !== undefined) updates.analysisTokens = FieldValue.increment(increments.analysisTokens);
            if (increments.indexingOps !== undefined) updates.indexingOps = FieldValue.increment(increments.indexingOps);
            if (increments.chatTokens !== undefined) updates.chatTokens = FieldValue.increment(increments.chatTokens);

            // TTL: set expiresAt to 24h from now (refreshed on every write)
            updates.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            // Track last activity time
            updates.lastActivityAt = FieldValue.serverTimestamp();

            await this.firestore.collection(this.COLLECTION_NAME).doc(userId).set(updates, { merge: true });

            this.logger.debug(
                { userId, increments },
                'Incremented lab usage stats',
            );
        } catch (error) {
            this.logger.error(
                { userId, error: (error as Error).message },
                'Failed to increment lab usage stats',
            );
            // Non-blocking error - we don't want to fail the user request if tracking fails
            // but we log it for monitoring.
        }
    }
}
