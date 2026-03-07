import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FIRESTORE_DB } from '../../../../core/firestore/firestore.provider';

export interface AdminSettings {
    systemPrompt: string;
    modelName: string;
    scoreThreshold: number;
}

const DEFAULTS: AdminSettings = {
    systemPrompt: '',
    modelName: 'gemini-3-flash-preview',
    scoreThreshold: 0.7,
};

@Injectable()
export class AdminSettingsService {
    private readonly logger = new Logger(AdminSettingsService.name);
    private readonly COLLECTION = 'admin_settings';
    private readonly DOC_ID = 'chat_config';

    private cache: AdminSettings | null = null;
    private cacheExpiry = 0;
    private readonly CACHE_TTL_MS = 60_000; // 1 minute

    constructor(
        @Inject(FIRESTORE_DB) private readonly db: admin.firestore.Firestore,
    ) {}

    async getSettings(): Promise<AdminSettings> {
        if (this.cache && Date.now() < this.cacheExpiry) {
            return this.cache;
        }

        try {
            const doc = await this.db.collection(this.COLLECTION).doc(this.DOC_ID).get();
            if (doc.exists) {
                const data = doc.data() as Partial<AdminSettings>;
                this.cache = {
                    systemPrompt: data.systemPrompt ?? DEFAULTS.systemPrompt,
                    modelName: data.modelName ?? DEFAULTS.modelName,
                    scoreThreshold: data.scoreThreshold ?? DEFAULTS.scoreThreshold,
                };
            } else {
                this.cache = { ...DEFAULTS };
            }
            this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
            return this.cache;
        } catch (error) {
            this.logger.error({
                msg: 'Failed to fetch admin settings',
                error: error instanceof Error ? error.message : 'Unknown',
            });
            return this.cache ?? { ...DEFAULTS };
        }
    }

    async updateSettings(partial: Partial<AdminSettings>): Promise<AdminSettings> {
        const current = await this.getSettings();
        const updated: AdminSettings = {
            systemPrompt: partial.systemPrompt ?? current.systemPrompt,
            modelName: partial.modelName ?? current.modelName,
            scoreThreshold: partial.scoreThreshold ?? current.scoreThreshold,
        };

        await this.db.collection(this.COLLECTION).doc(this.DOC_ID).set(updated, { merge: true });

        this.cache = updated;
        this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;

        this.logger.log({ msg: 'Admin settings updated', modelName: updated.modelName });
        return updated;
    }
}
