import { Controller, Get, Inject, ForbiddenException, Headers } from '@nestjs/common';
import { ChatProviderPort } from './modules/chat/domain/ports/chat-provider.port';
import { PersistencePort } from './modules/chat/domain/ports/persistence.port';
import { VectorDbPort } from './modules/chat/domain/ports/vector-db.port';
import { GeminiAiAdapter } from './modules/chat/infrastructure/adapters/gemini-ai.adapter';
import { FirestorePersistenceAdapter } from './modules/chat/infrastructure/adapters/firestore-persistence.adapter';
import { QdrantVectorDbAdapter } from './modules/chat/infrastructure/adapters/qdrant-vector-db.adapter';

@Controller()
export class AppController {

    constructor(
        @Inject(GeminiAiAdapter) private readonly ai: ChatProviderPort,
        @Inject(FirestorePersistenceAdapter) private readonly repo: PersistencePort,
        @Inject(QdrantVectorDbAdapter) private readonly qdrant: VectorDbPort,
    ) { }

    @Get()
    root() {
        return {
            message: 'API is running',
            docs: '/api/docs',
            version: process.env.npm_package_version || '0.0.1'
        };
    }

    @Get('health')
    healthCheck() {
        const memoryUsage = process.memoryUsage();
        return {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
            }
        };
    }

    /**
     * Debug endpoint — only accessible with ADMIN_SECRET header.
     * Returns diagnostic info about connectivity to Firestore, Gemini, Qdrant.
     */
    @Get('debug-chat')
    async debugChat(@Headers('x-admin-secret') adminSecret: string) {
        const expectedSecret = process.env.ADMIN_SECRET;
        if (!expectedSecret || adminSecret !== expectedSecret) {
            throw new ForbiddenException('Unauthorized');
        }

        const results: Record<string, string> = {};
        const testMessage = 'test';
        const testSessionId = 'debug-session';

        // Step 1: Firestore getHistory
        try {
            const history = await this.repo.getHistory(testSessionId, 2);
            results['step1_firestore_history'] = `OK — ${history.length} messages`;
        } catch (e) {
            results['step1_firestore_history'] = `FAILED: ${e.message}`;
        }

        // Step 2: Gemini embedding
        try {
            const embedding = await this.ai.generateEmbedding(testMessage);
            results['step2_gemini_embedding'] = `OK — dim=${embedding.length}`;
        } catch (e) {
            results['step2_gemini_embedding'] = `FAILED: ${e.message}`;
        }

        // Step 3: Qdrant search (only if embedding succeeded)
        if (results['step2_gemini_embedding'].startsWith('OK')) {
            try {
                const embedding = await this.ai.generateEmbedding(testMessage);
                const context = await this.qdrant.search(embedding, 0.6);
                results['step3_qdrant_search'] = `OK — context length=${context.length}`;
            } catch (e) {
                results['step3_qdrant_search'] = `FAILED: ${e.message}`;
            }
        } else {
            results['step3_qdrant_search'] = 'SKIPPED (embedding failed)';
        }

        // Step 4: Gemini stream (just first chunk)
        try {
            const stream = this.ai.generateResponseStream(testMessage, 'You are a test bot. Say hello.', []);
            let firstChunk = '';
            for await (const chunk of stream) {
                firstChunk = chunk;
                break; // Just get the first chunk
            }
            results['step4_gemini_stream'] = `OK — first chunk: "${firstChunk.substring(0, 100)}"`;
        } catch (e) {
            results['step4_gemini_stream'] = `FAILED: ${e.message}`;
        }

        return results;
    }
}

