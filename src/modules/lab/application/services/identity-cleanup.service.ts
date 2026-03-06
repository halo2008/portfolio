import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
    EPHEMERAL_USER_REPO_PORT,
    EphemeralUserRepoPort,
} from '../../domain/ports/ephemeral-user-repo.port';
import {
    KNOWLEDGE_REPO_PORT,
    KnowledgeRepoPort,
    RagSecurityContext,
} from '../../../knowledge/domain/ports/knowledge-repo.port';
import { EphemeralUser } from '../../domain/entities/ephemeral-user.entity';
import { LabUsageService } from '../services/lab-usage.service';

/**
 * CleanupReport
 * Explaining: Structured report of the cleanup operation results.
 */
export interface CleanupReport {
    processed: number;
    succeeded: number;
    failed: number;
    errors: string[];
}

/**
 * IdentityCleanupService
 * Explaining: Service for deleting expired demo users and their data.
 * Implements the "24h Reaper" pattern - deletes users after their 24h demo session expires.
 *
 * Cleanup sequence (all-or-nothing per user):
 * 1. Delete all Qdrant vectors where payload.user_id == uid
 * 2. If Step 1 succeeds, delete Firebase Auth account via Admin SDK
 * 3. Delete Firestore ephemeral user document
 *
 * Data consistency: Never delete Auth or Firestore if Step 1 fails.
 */
@Injectable()
export class IdentityCleanupService {
    private readonly logger = new Logger(IdentityCleanupService.name);

    constructor(
        @Inject(EPHEMERAL_USER_REPO_PORT)
        private readonly ephemeralUserRepo: EphemeralUserRepoPort,
        @Inject(KNOWLEDGE_REPO_PORT)
        private readonly knowledgeRepo: KnowledgeRepoPort,
        private readonly labUsageService: LabUsageService,
    ) {}

    /**
     * Cleanup expired users.
     * Explaining: Finds all expired demo users and deletes their data.
     * Queries Firestore for users where expiresAt < now(), then for each:
     * - Deletes Qdrant vectors
     * - Deletes Firebase Auth account
     * - Deletes Firestore document
     * @returns Promise with cleanup report containing processed/succeeded/failed counts
     */
    async cleanupExpiredUsers(): Promise<CleanupReport> {
        const now = new Date();
        const report: CleanupReport = {
            processed: 0,
            succeeded: 0,
            failed: 0,
            errors: [],
        };

        this.logger.log(
            { timestamp: now.toISOString() },
            'Starting expired user cleanup',
        );

        // Find all expired users
        let expiredUsers: EphemeralUser[];
        try {
            expiredUsers = await this.ephemeralUserRepo.findExpired(now);
        } catch (error) {
            const errorMsg = `Failed to query expired users: ${(error as Error).message}`;
            this.logger.error(
                { error: (error as Error).message },
                'Failed to query expired users',
            );
            report.errors.push(errorMsg);
            return report;
        }

        report.processed = expiredUsers.length;

        this.logger.log(
            { expiredUserCount: expiredUsers.length },
            `Found ${expiredUsers.length} expired users to cleanup`,
        );

        // Process each expired user
        for (const user of expiredUsers) {
            const userId = user.uid.toString();
            try {
                await this.cleanupSingleUser(user);
                report.succeeded++;
                this.logger.log(
                    { userId, email: user.email },
                    'Successfully cleaned up expired user',
                );
            } catch (error) {
                report.failed++;
                const errorMsg = `Failed to cleanup user ${userId}: ${(error as Error).message}`;
                report.errors.push(errorMsg);
                this.logger.error(
                    { userId, email: user.email, error: (error as Error).message },
                    'Failed to cleanup expired user',
                );
            }
        }

        this.logger.log(
            {
                processed: report.processed,
                succeeded: report.succeeded,
                failed: report.failed,
            },
            'Expired user cleanup completed',
        );

        return report;
    }

    /**
     * Cleanup a single user.
     * Explaining: Deletes all data for a single user with consistency guarantees.
     * Steps (all-or-nothing):
     * 1. Delete Qdrant vectors with user_id filter
     * 2. Delete Firebase Auth account
     * 3. Delete Firestore document
     *
     * If Step 1 fails, no other steps are executed (data consistency).
     * @param user The expired ephemeral user to cleanup
     * @throws Error if any step fails (caller handles error reporting)
     */
    private async cleanupSingleUser(user: EphemeralUser): Promise<void> {
        const userId = user.uid.toString();

        this.logger.debug(
            { userId, email: user.email },
            'Starting cleanup for user',
        );

        // Step 1: Delete Qdrant vectors
        // Explaining: Must succeed before proceeding (data consistency)
        await this.deleteUserVectors(userId);

        // Step 2: Delete Firebase Auth account
        // Explaining: Only executes if Step 1 succeeded
        await this.deleteFirebaseAuthUser(userId);

        // Step 3: Delete Firestore ephemeral_users document
        // Explaining: Final cleanup step
        await this.deleteFirestoreDocument(user.uid);

        // Step 4: Delete lab_usage document
        // Explaining: Prevents orphaned usage tracking documents from accumulating
        await this.labUsageService.cleanupUserData(userId);

        this.logger.debug(
            { userId },
            'All cleanup steps completed for user',
        );
    }

    /**
     * Delete all Qdrant vectors for a user.
     * Explaining: Uses knowledgeRepo.deleteByUserId with security context.
     * Creates a synthetic security context for cleanup operations.
     * @param userId The user's Firebase UID
     * @throws Error if deletion fails
     */
    private async deleteUserVectors(userId: string): Promise<void> {
        this.logger.debug(
            { userId },
            'Step 1: Deleting Qdrant vectors for user',
        );

        // Create synthetic security context for cleanup
        // Explaining: Cleanup service acts on behalf of the user being deleted
        const context: RagSecurityContext = {
            userId,
            role: 'demo',
            language: 'en',
        };

        try {
            const deletedCount = await this.knowledgeRepo.deleteByUserId(
                userId,
                context,
            );
            this.logger.debug(
                { userId, deletedCount },
                'Deleted Qdrant vectors for user',
            );
        } catch (error) {
            this.logger.error(
                { userId, error: (error as Error).message },
                'Step 1 failed: Could not delete Qdrant vectors',
            );
            throw error; // Propagate error - Step 1 must succeed
        }
    }

    /**
     * Delete Firebase Auth account.
     * Explaining: Uses Firebase Admin SDK to delete the user's Auth account.
     * Only called if Step 1 (Qdrant deletion) succeeded.
     * @param userId The user's Firebase UID
     * @throws Error if deletion fails
     */
    private async deleteFirebaseAuthUser(userId: string): Promise<void> {
        this.logger.debug(
            { userId },
            'Step 2: Deleting Firebase Auth account',
        );

        try {
            await admin.auth().deleteUser(userId);
            this.logger.debug(
                { userId },
                'Deleted Firebase Auth account',
            );
        } catch (error) {
            this.logger.error(
                { userId, error: (error as Error).message },
                'Step 2 failed: Could not delete Firebase Auth account',
            );
            throw error;
        }
    }

    /**
     * Delete Firestore ephemeral user document.
     * Explaining: Removes the user's document from ephemeral_users collection.
     * Final step in the cleanup sequence.
     * @param uid The user's UID value object
     * @throws Error if deletion fails
     */
    private async deleteFirestoreDocument(uid: {
        toString(): string;
    }): Promise<void> {
        const userId = uid.toString();

        this.logger.debug(
            { userId },
            'Step 3: Deleting Firestore document',
        );

        try {
            await this.ephemeralUserRepo.delete(uid as import('../../domain/value-objects/user-id.vo').UserId);
            this.logger.debug(
                { userId },
                'Deleted Firestore document',
            );
        } catch (error) {
            this.logger.error(
                { userId, error: (error as Error).message },
                'Step 3 failed: Could not delete Firestore document',
            );
            throw error;
        }
    }
}
