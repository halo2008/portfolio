import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const lokiHost = process.env.LOKI_HOST;
const lokiUser = process.env.LOKI_USERNAME;
const lokiPass = process.env.LOKI_PASSWORD;

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
                                    username: lokiUser,
                                    password: lokiPass,
                                },
                                batching: false,
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

    async onModuleInit() {
        this.logger.log('=== Loki Diagnostics ===');
        this.logger.log(`LOKI_HOST: ${lokiHost ? lokiHost : '(not set)'}`);
        this.logger.log(`LOKI_USERNAME: ${lokiUser ? lokiUser.slice(0, 3) + '***' : '(not set)'}`);
        this.logger.log(`LOKI_PASSWORD: ${lokiPass ? '***set (' + lokiPass.length + ' chars)' : '(not set)'}`);
        this.logger.log(`NODE_ENV: ${process.env.NODE_ENV || '(not set)'}`);

        if (!lokiHost) {
            this.logger.warn('LOKI_HOST not set — logs go to stdout only');
            return;
        }

        if (!lokiUser || !lokiPass) {
            this.logger.error('LOKI_HOST is set but LOKI_USERNAME or LOKI_PASSWORD is missing!');
            return;
        }

        this.logger.log(`Loki transport enabled → ${lokiHost}`);

        // Test push to Loki
        try {
            const pushUrl = `${lokiHost}/loki/api/v1/push`;
            const now = `${Date.now()}000000`; // nanoseconds
            const payload = JSON.stringify({
                streams: [{
                    stream: { application: 'portfolio-backend', level: 'info', source: 'diagnostics' },
                    values: [[now, JSON.stringify({ msg: 'Loki connectivity test from LoggerModule startup' })]],
                }],
            });

            const auth = Buffer.from(`${lokiUser}:${lokiPass}`).toString('base64');
            const res = await fetch(pushUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${auth}`,
                },
                body: payload,
            });

            if (res.ok || res.status === 204) {
                this.logger.log(`Loki test push OK (${res.status}) → ${pushUrl}`);
            } else {
                const body = await res.text().catch(() => '');
                this.logger.error(`Loki test push FAILED (${res.status}): ${body.slice(0, 300)}`);
            }
        } catch (err) {
            this.logger.error(`Loki test push ERROR: ${(err as Error).message}`);
        }

        this.logger.log('=== End Loki Diagnostics ===');
    }
}
