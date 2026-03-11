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

function validateCloudSchedulerSecret(headerValue: string | undefined): boolean {
    const expectedSecret = process.env.CLOUD_SCHEDULER_SECRET;
    
    if (!expectedSecret) {
        return false;
    }
    
    if (!headerValue || headerValue.length !== expectedSecret.length) {
        return false;
    }
    
    let result = 0;
    for (let i = 0; i < headerValue.length; i++) {
        result |= headerValue.charCodeAt(i) ^ expectedSecret.charCodeAt(i);
    }
    return result === 0;
}

@Controller('admin')
@UseGuards(FirebaseAuthGuard)
@Roles('admin')
export class CleanupController {
    private readonly logger = new Logger(CleanupController.name);

    constructor(
        private readonly identityCleanupService: IdentityCleanupService,
    ) {}

    @Post('cleanup')
    async cleanup(
        @Headers('x-cloud-scheduler') cloudSchedulerSecret: string | undefined,
    ): Promise<CleanupReport> {
        const timestamp = new Date().toISOString();
        
        this.logger.log(
            { 
                timestamp, 
                hasSecret: !!cloudSchedulerSecret,
                secretLength: cloudSchedulerSecret?.length ?? 0,
            },
            'Cleanup endpoint accessed - validating credentials',
        );

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
