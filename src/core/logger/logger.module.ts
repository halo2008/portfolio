import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                transport: process.env.LOKI_HOST ? {
                    targets: [
                        {
                            target: 'pino-loki',
                            options: {
                                host: process.env.LOKI_HOST,
                                basicAuth: {
                                    username: process.env.LOKI_USERNAME,
                                    password: process.env.LOKI_PASSWORD,
                                },
                                batching: true,
                                interval: 2,
                                labels: { application: 'portfolio-backend' },
                                propsToLabels: ['level'],
                            },
                        },
                        {
                            target: 'pino/file',
                            options: { destination: 1 },
                        },
                    ],
                } : process.env.NODE_ENV !== 'production'
                    ? { target: 'pino-pretty' }
                    : undefined,
            },
        }),
    ],
    exports: [PinoLoggerModule],
})
export class LoggerModule { }
