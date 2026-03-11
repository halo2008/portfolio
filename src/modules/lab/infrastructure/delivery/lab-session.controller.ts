import {
    Controller,
    Post,
    Req,
    Inject,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { Firestore } from '@google-cloud/firestore';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { FIRESTORE_DB } from '../../../../core/firestore/firestore.provider';
import { KNOWLEDGE_REPO_PORT, KnowledgeRepoPort } from '../../../knowledge/domain/ports/knowledge-repo.port';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

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

    constructor(
        @Inject(FIRESTORE_DB) private readonly firestore: Firestore,
        @Inject(KNOWLEDGE_REPO_PORT) private readonly knowledgeRepo: KnowledgeRepoPort,
    ) { }

    @Post('session')
    async createSession(
        @Req() req: Request,
    ): Promise<{ token: string }> {
        const ip = this.extractIp(req);

        if (!ip) {
            this.logger.warn('Could not determine client IP');
            throw new InternalServerErrorException('Could not determine client identity');
        }

        const uid = this.ipToUid(ip);

        try {
            const customToken = await admin.auth().createCustomToken(uid);

            await this.ensureEphemeralUserDoc(uid);

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

    /**
     * Creates ephemeral_users doc if it doesn't exist, or refreshes expiresAt
     * if the previous session already expired (same IP returning).
     */
    private async ensureEphemeralUserDoc(uid: string): Promise<void> {
        const docRef = this.firestore.collection('ephemeral_users').doc(uid);
        const doc = await docRef.get();

        const now = new Date();
        const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

        if (!doc.exists) {
            await docRef.set({
                uid,
                email: `${uid}@demo.lab`,
                createdAt: now,
                role: 'demo',
                expiresAt,
            });
            return;
        }

        const data = doc.data();
        const existingExpiry = data?.expiresAt?.toDate?.() ?? data?.expiresAt;
        if (existingExpiry && existingExpiry < now) {
            this.logger.log({ uid }, 'Expired session detected, cleaning old vectors');
            try {
                await this.knowledgeRepo.deleteByUserId(uid, {
                    userId: uid,
                    role: 'demo',
                    language: 'en',
                });
            } catch (e) {
                this.logger.warn({ uid, error: (e as Error).message }, 'Failed to clean old vectors on session refresh');
            }
            await docRef.update({ expiresAt, createdAt: now });
        }
    }

    private extractIp(req: Request): string | undefined {
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
        const hash = crypto.createHash('sha256').update(`lab-session:${ip}`).digest('hex');
        return `lab_${hash.substring(0, 28)}`;
    }

    private maskIp(ip: string): string {
        const parts = ip.split('.');
        if (parts.length === 4) {
            parts[3] = 'xxx';
            return parts.join('.');
        }
        return ip.split(':').slice(0, 3).join(':') + ':...';
    }
}
