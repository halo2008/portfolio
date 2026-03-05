import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
    RawBodyRequest,
} from '@nestjs/common';
import { Request } from 'express';
import * as crypto from 'crypto';

/**
 * SlackSignatureGuard
 * Verifies that incoming requests are genuinely from Slack
 * using HMAC-SHA256 signature verification.
 *
 * Slack docs: https://api.slack.com/authentication/verifying-requests-from-slack
 *
 * Verification steps:
 * 1. Extract X-Slack-Signature and X-Slack-Request-Timestamp headers
 * 2. Reject if timestamp is older than 5 minutes (replay attack prevention)
 * 3. Compute HMAC-SHA256 of "v0:{timestamp}:{rawBody}" with SLACK_SIGNING_SECRET
 * 4. Compare computed signature with X-Slack-Signature using timing-safe comparison
 */
@Injectable()
export class SlackSignatureGuard implements CanActivate {
    private readonly logger = new Logger(SlackSignatureGuard.name);
    private readonly FIVE_MINUTES_IN_SECONDS = 5 * 60;

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        const signingSecret = process.env.SLACK_SIGNING_SECRET;
        if (!signingSecret) {
            this.logger.error('SLACK_SIGNING_SECRET is not configured');
            throw new ForbiddenException('Slack verification unavailable');
        }

        const timestamp = request.headers['x-slack-request-timestamp'] as string;
        const slackSignature = request.headers['x-slack-signature'] as string;

        if (!timestamp || !slackSignature) {
            this.logger.warn({
                ip: request.ip,
                path: request.path,
            }, 'Missing Slack signature headers');
            throw new ForbiddenException('Missing Slack signature');
        }

        // Replay attack prevention: reject requests older than 5 minutes
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - parseInt(timestamp, 10)) > this.FIVE_MINUTES_IN_SECONDS) {
            this.logger.warn({
                ip: request.ip,
                timestamp,
                now,
            }, 'Slack request timestamp too old (possible replay attack)');
            throw new ForbiddenException('Request timestamp expired');
        }

        // Compute expected signature
        // Slack sends raw body, we need to use it for signature computation
        const rawBody = (request as any).rawBody || JSON.stringify(request.body);
        const sigBaseString = `v0:${timestamp}:${rawBody}`;
        const expectedSignature = 'v0=' + crypto
            .createHmac('sha256', signingSecret)
            .update(sigBaseString, 'utf8')
            .digest('hex');

        // Timing-safe comparison to prevent timing attacks
        try {
            const sigBuffer = Buffer.from(slackSignature, 'utf8');
            const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

            if (sigBuffer.length !== expectedBuffer.length ||
                !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
                this.logger.warn({
                    ip: request.ip,
                    path: request.path,
                }, 'Invalid Slack signature — request rejected');
                throw new ForbiddenException('Invalid Slack signature');
            }
        } catch (error) {
            if (error instanceof ForbiddenException) throw error;
            this.logger.warn({
                ip: request.ip,
                error: (error as Error).message,
            }, 'Slack signature verification failed');
            throw new ForbiddenException('Invalid Slack signature');
        }

        return true;
    }
}
