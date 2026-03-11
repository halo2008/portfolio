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

export interface CleanupReport {
    processed: number;
    succeeded: number;
    failed: number;
    errors: string[];
}

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

    private async cleanupSingleUser(user: EphemeralUser): Promise<void> {
        const userId = user.uid.toString();

        this.logger.debug(
            { userId, email: user.email },
            'Starting cleanup for user',
        );

        await this.deleteUserVectors(userId);
        await this.deleteFirebaseAuthUser(userId);
        await this.deleteFirestoreDocument(user.uid);
        await this.labUsageService.cleanupUserData(userId);

        this.logger.debug(
            { userId },
            'All cleanup steps completed for user',
        );
    }

    private async deleteUserVectors(userId: string): Promise<void> {
        this.logger.debug(
            { userId },
            'Step 1: Deleting Qdrant vectors for user',
        );

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
