import { Module } from '@nestjs/common';
import { LoggerModule } from './core/logger/logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { PrometheusModule, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { ChatModule } from './modules/chat/chat.module';
import { IngestionModule } from './ingestion/ingestion.module';

const clientDistPath = resolve(__dirname, '..', 'dist', 'static');
// Logger.log(`Serving static files from: ${clientDistPath}`, 'AppModule');

import { AppController } from './app.controller';
import { HttpMetricsMiddleware, METRIC_HTTP_DURATION } from './core/metrics/http-metrics.middleware';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';

@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: clientDistPath,
            exclude: ['/api/{*path}', '/metrics'],
        }),
        PrometheusModule.register(),
        ChatModule,
        IngestionModule,
    ],
    controllers: [AppController],
    providers: [
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
