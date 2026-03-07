import {
    Controller,
    Post,
    Req,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

/**
 * Public controller (no FirebaseAuthGuard) that maps client IP to a
 * deterministic Firebase UID and returns a custom token.
 *
 * This avoids the need for signInAnonymously on the client, which is
 * frequently blocked by ad-blockers and Safari ITP on mobile devices.
 */
@Controller('lab')
export class LabSessionController {
    private readonly logger = new Logger(LabSessionController.name);

    @Post('session')
    async createSession(
        @Req() req: Request,
    ): Promise<{ token: string }> {
        const ip = this.extractIp(req);

        if (!ip) {
            this.logger.warn('Could not determine client IP');
            throw new InternalServerErrorException('Could not determine client identity');
        }

        // Deterministic UID from IP — same IP always gets the same session
        const uid = this.ipToUid(ip);

        try {
            const customToken = await admin.auth().createCustomToken(uid);

            this.logger.log({ uid, ip: this.maskIp(ip) }, 'Session token created for IP');

            return { token: customToken };
        } catch (error) {
            this.logger.error({
                uid,
                error: (error as Error).message,
            }, 'Failed to create session token');
            throw new InternalServerErrorException('Failed to create session');
        }
    }

    private extractIp(req: Request): string | undefined {
        // Cloud Run sets x-forwarded-for
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        if (Array.isArray(forwarded) && forwarded.length > 0) {
            return forwarded[0].split(',')[0].trim();
        }
        return req.ip;
    }

    private ipToUid(ip: string): string {
        // SHA-256 hash → take first 28 chars for a valid Firebase UID
        const hash = crypto.createHash('sha256').update(`lab-session:${ip}`).digest('hex');
        return `lab_${hash.substring(0, 28)}`;
    }

    private maskIp(ip: string): string {
        // Mask last octet for logging privacy
        const parts = ip.split('.');
        if (parts.length === 4) {
            parts[3] = 'xxx';
            return parts.join('.');
        }
        // IPv6 — just show first segment
        return ip.split(':').slice(0, 3).join(':') + ':...';
    }
}
