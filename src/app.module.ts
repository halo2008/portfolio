import { Module, Logger } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { ChatModule } from './chat/chat.module';
import { IngestionModule } from './ingestion/ingestion.module';

const clientDistPath = resolve(__dirname, '..', 'dist', 'static');
Logger.log(`Serving static files from: ${clientDistPath}`, 'AppModule');

import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot(),
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
