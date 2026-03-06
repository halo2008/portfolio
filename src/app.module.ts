import { Module } from '@nestjs/common';
import { LoggerModule } from './core/logger/logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { PrometheusModule, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { ChatModule } from './modules/chat/chat.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { LabModule } from './modules/lab/lab.module';
import { UsemeModule } from './modules/useme/useme.module';

const clientDistPath = resolve(__dirname, '..', 'dist', 'static');
// Logger.log(`Serving static files from: ${clientDistPath}`, 'AppModule');

import { AppController } from './app.controller';
import { HttpMetricsMiddleware, METRIC_HTTP_DURATION } from './core/metrics/http-metrics.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
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
        UsemeModule,
    ],
    controllers: [AppController],
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
