import { Module } from '@nestjs/common';
import { LoggerModule } from './core/logger/logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { PrometheusModule, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { LabModule } from './modules/lab/lab.module';
import { LeadModule } from './modules/lead/lead.module';

const clientDistPath = resolve(__dirname, '..', 'dist', 'static');

// Vite output in /assets/ carries a content hash in the file name, so it never changes under the same URL.
const HASHED_ASSET = /[\\/]assets[\\/][^\\/]+-[A-Za-z0-9_-]{8}\.(js|css)$/;
const MEDIA = /\.(webp|avif|jpe?g|png|gif|svg|ico|woff2?)$/;

/** Hashed bundles: a year; pictures and fonts: a week; everything else (HTML, the kit's unhashed CSS/JS): revalidate. */
export const setStaticCacheHeaders = (res: { setHeader: (name: string, value: string) => void }, filePath: string): void => {
    if (HASHED_ASSET.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    else if (MEDIA.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=604800');
    else res.setHeader('Cache-Control', 'no-cache');
};

import { AppController } from './app.controller';
import { HealthController } from './health.controller';
import { HttpMetricsMiddleware, METRIC_HTTP_DURATION } from './core/metrics/http-metrics.middleware';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { FirestoreModule } from './core/firestore/firestore.module';
import { GenAiModule } from './core/genai/genai.module';

@Module({
    imports: [
        FirestoreModule,
        GenAiModule,
        LoggerModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: clientDistPath,
            exclude: ['/api/{*path}', '/metrics'],
            serveStaticOptions: { setHeaders: setStaticCacheHeaders },
        }),
        ThrottlerModule.forRoot([{
            name: 'short',
            ttl: 60000,
            limit: 10,
        }, {
            name: 'demo',
            ttl: 60000,
            limit: 3,
        }]),
        PrometheusModule.register(),
        ChatModule,
        KnowledgeModule,
        LabModule,
        LeadModule,
    ],
    controllers: [AppController, HealthController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        makeHistogramProvider({
            name: METRIC_HTTP_DURATION,
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.05, 0.1, 0.5, 1, 3, 5],
        }),
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(HttpMetricsMiddleware).forRoutes('*');
    }
}
