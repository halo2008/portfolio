import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const lokiHost = process.env.LOKI_HOST;
const lokiUser = process.env.LOKI_USERNAME;

@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                transport: lokiHost ? {
                    targets: [
                        {
                            target: 'pino-loki',
                            options: {
                                host: lokiHost,
                                basicAuth: {
                                    username: process.env.LOKI_USERNAME,
                                    password: process.env.LOKI_PASSWORD,
                                },
                                batching: true,
                                interval: 2,
                                labels: { application: 'portfolio-backend' },
                                propsToLabels: ['level'],
                                silenceErrors: false,
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
export class LoggerModule implements OnModuleInit {
    private readonly logger = new Logger('LoggerModule');

    onModuleInit() {
        if (lokiHost) {
            this.logger.log(`Loki transport enabled → ${lokiHost} (user: ${lokiUser?.slice(0, 3)}***)`);
        } else {
            this.logger.warn('LOKI_HOST not set — logs go to stdout only');
        }
    }
}
