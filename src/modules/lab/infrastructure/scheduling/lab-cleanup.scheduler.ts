import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IdentityCleanupService } from '../../application/services/identity-cleanup.service';

@Injectable()
export class LabCleanupScheduler {
    private readonly logger = new Logger(LabCleanupScheduler.name);
    private isRunning = false;

    constructor(
        private readonly identityCleanupService: IdentityCleanupService,
    ) { }

    /** Runs every hour — finds expired demo users and cleans up their data (Qdrant, Auth, Firestore) */
    @Cron(CronExpression.EVERY_HOUR)
    async handleCleanup(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Cleanup already in progress, skipping this run');
            return;
        }

        this.isRunning = true;

        try {
            this.logger.log('Scheduled cleanup started');
            const report = await this.identityCleanupService.cleanupExpiredUsers();
            this.logger.log({
                processed: report.processed,
                succeeded: report.succeeded,
                failed: report.failed,
            }, 'Scheduled cleanup completed');
        } catch (error) {
            this.logger.error(
                { error: (error as Error).message },
                'Scheduled cleanup failed',
            );
        } finally {
            this.isRunning = false;
        }
    }
}
