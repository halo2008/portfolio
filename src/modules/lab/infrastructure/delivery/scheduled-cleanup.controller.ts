import {
    Controller,
    Post,
    Headers,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
    IdentityCleanupService,
    CleanupReport,
} from '../../application/services/identity-cleanup.service';

@Controller('api/scheduler')
@SkipThrottle()
export class ScheduledCleanupController {
    private readonly logger = new Logger(ScheduledCleanupController.name);

    constructor(
        private readonly identityCleanupService: IdentityCleanupService,
    ) {}

    @Post('cleanup')
    async cleanup(
        @Headers('x-cloud-scheduler-secret') secret: string | undefined,
    ): Promise<CleanupReport> {
        this.validateSecret(secret);

        this.logger.log('Cloud Scheduler cleanup triggered');

        const report = await this.identityCleanupService.cleanupExpiredUsers();

        this.logger.log({
            processed: report.processed,
            succeeded: report.succeeded,
            failed: report.failed,
        }, 'Scheduled cleanup completed');

        return report;
    }

    private validateSecret(headerValue: string | undefined): void {
        const expectedSecret = process.env.CLOUD_SCHEDULER_SECRET;

        if (!expectedSecret || !headerValue) {
            throw new ForbiddenException();
        }

        if (headerValue.length !== expectedSecret.length) {
            throw new ForbiddenException();
        }

        let result = 0;
        for (let i = 0; i < headerValue.length; i++) {
            result |= headerValue.charCodeAt(i) ^ expectedSecret.charCodeAt(i);
        }

        if (result !== 0) {
            throw new ForbiddenException();
        }
    }
}
