import { Module } from '@nestjs/common';
import { LoggerModule } from './core/logger/logger.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { ChatModule } from './modules/chat/chat.module';
import { IngestionModule } from './ingestion/ingestion.module';

const clientDistPath = resolve(__dirname, '..', 'dist', 'static');
// Logger.log(`Serving static files from: ${clientDistPath}`, 'AppModule');

import { AppController } from './app.controller';

@Module({
    imports: [
        LoggerModule,
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: clientDistPath,
            exclude: ['/api/{*path}'],
        }),
        ChatModule,
        IngestionModule,
    ],
    controllers: [AppController],
})
export class AppModule { }
