import {
    Controller,
    Post,
    Headers,
    UseGuards,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../../../../core/auth/firebase-auth.guard';
import { Roles } from '../../../../core/auth/roles.decorator';
import {
    IdentityCleanupService,
    CleanupReport,
} from '../../application/services/identity-cleanup.service';

/**
 * CloudSchedulerSecret
 * Explaining: Validates the X-Cloud-Scheduler header against the configured secret.
 * This provides an additional layer of security for automated/cron job endpoints.
 * @param headerValue The value from X-Cloud-Scheduler header
 * @returns boolean indicating if the secret is valid
 */
function validateCloudSchedulerSecret(headerValue: string | undefined): boolean {
    const expectedSecret = process.env.CLOUD_SCHEDULER_SECRET;
    
    // If no secret is configured, reject all requests (secure by default)
    if (!expectedSecret) {
        return false;
    }
    
    // Validate using constant-time comparison to prevent timing attacks
    if (!headerValue || headerValue.length !== expectedSecret.length) {
        return false;
    }
    
    let result = 0;
    for (let i = 0; i < headerValue.length; i++) {
        result |= headerValue.charCodeAt(i) ^ expectedSecret.charCodeAt(i);
    }
    return result === 0;
}

/**
 * CleanupController
 * Explaining: Secure admin-only endpoint for triggering cleanup of expired demo users.
 * Protected by Firebase Auth, admin role verification, and Cloud Scheduler secret.
 * 
 * Acceptance Criteria:
 * - POST /admin/cleanup - triggers cleanup of expired ephemeral users
 * - Protected by FirebaseAuthGuard with @Roles('admin') decorator
 * - Requires X-Cloud-Scheduler header with valid secret
 * - Returns CleanupReport JSON on success (200)
 * - Returns 403 for unauthorized access or invalid secret
 * - Logs all access attempts for audit trail
 */
@Controller('admin')
@UseGuards(FirebaseAuthGuard)
@Roles('admin')
export class CleanupController {
    private readonly logger = new Logger(CleanupController.name);

    constructor(
        private readonly identityCleanupService: IdentityCleanupService,
    ) {}

    /**
     * POST /admin/cleanup
     * Explaining: Triggers cleanup of expired demo users and their data.
     * Requires admin role and valid X-Cloud-Scheduler secret.
     * 
     * Cleanup sequence for each expired user:
     * 1. Delete Qdrant vectors
     * 2. Delete Firebase Auth account
     * 3. Delete Firestore document
     * 
     * @param cloudSchedulerSecret The X-Cloud-Scheduler header value
     * @returns CleanupReport with processed/succeeded/failed counts
     * @throws ForbiddenException if secret is invalid or admin role not verified
     */
    @Post('cleanup')
    async cleanup(
        @Headers('x-cloud-scheduler') cloudSchedulerSecret: string | undefined,
    ): Promise<CleanupReport> {
        const timestamp = new Date().toISOString();
        
        // Log access attempt (before validation to capture all attempts)
        this.logger.log(
            { 
                timestamp, 
                hasSecret: !!cloudSchedulerSecret,
                secretLength: cloudSchedulerSecret?.length ?? 0,
            },
            'Cleanup endpoint accessed - validating credentials',
        );

        // Validate Cloud Scheduler secret
        if (!validateCloudSchedulerSecret(cloudSchedulerSecret)) {
            this.logger.warn(
                { 
                    timestamp,
                    hasSecret: !!cloudSchedulerSecret,
                },
                'Cleanup access denied: invalid or missing X-Cloud-Scheduler secret',
            );
            throw new ForbiddenException('Invalid or missing scheduler secret');
        }

        // Secret is valid, proceed with cleanup
        this.logger.log(
            { timestamp },
            'Cloud Scheduler secret validated - starting cleanup',
        );

        try {
            const report = await this.identityCleanupService.cleanupExpiredUsers();

            this.logger.log(
                {
                    timestamp,
                    processed: report.processed,
                    succeeded: report.succeeded,
                    failed: report.failed,
                    hasErrors: report.errors.length > 0,
                },
                'Cleanup completed successfully',
            );

            return report;
        } catch (error) {
            this.logger.error(
                {
                    timestamp,
                    error: (error as Error).message,
                },
                'Cleanup failed with error',
            );
            throw error;
        }
    }
}
