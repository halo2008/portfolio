import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as basicAuth from 'express-basic-auth';

async function bootstrap(): Promise<void> {
    try {
        const app = await NestFactory.create(AppModule, { bufferLogs: true });

        app.useLogger(app.get(Logger));

        // Low-level blocker for unwanted crawlers/monitors
        app.use((req: any, res: any, next: any) => {
            const ua = req.headers['user-agent'] || '';
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
            const host = req.headers['host'] || '';
            
            // Allow only specific hosts to prevent direct .run.app access from keeping instance alive
            const allowedHosts = ['ks-infra.dev', 'localhost', '127.0.0.1'];
            const isInternalHealthCheck = req.path === '/internal/status' && (ua.includes('GoogleHC') || !host.includes('.run.app'));
            const isAllowedHost = allowedHosts.some(allowed => host.includes(allowed)) || isInternalHealthCheck;

            if (host.includes('.run.app') && !isAllowedHost) {
                return res.status(403).send('Forbidden: Access via direct Cloud Run URL is disabled.');
            }

            const blockedIps = ['74.63.225.228', '64.251.27.142'];
            const isBlockedIp = blockedIps.some(blocked => ip.includes(blocked));

            if (ua.includes('UptimeRobot') || isBlockedIp) {
                return res.status(410).end();
            }
            next();
        });

        const logger = app.get(Logger);

        app.enableCors({
            origin: process.env.ALLOWED_CORS_ORIGINS?.split(',') || false,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
        });

        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https://grainy-gradients.vercel.app"],
                    frameSrc: ["'self'", "https://www.google.com", "https://www.recaptcha.net"],
                    connectSrc: ["'self'", "https://www.google.com", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firestore.googleapis.com"],
                },
            },
        }));
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }));

        const metricsUser = process.env.GRAFANA_METRICS_USER;
        const metricsPassword = process.env.GRAFANA_METRICS_PASSWORD;

        if (metricsUser && metricsPassword) {
            app.use('/metrics', basicAuth({
                users: { [metricsUser]: metricsPassword },
                challenge: true,
            }));
        } else {
            logger.warn('Metrics authentication credentials missing. The /metrics endpoint might be exposed or broken.');
        }

        app.setGlobalPrefix('api', { exclude: ['/metrics'] });

        app.enableShutdownHooks();

        const port = process.env.PORT || 8080;
        const host = '0.0.0.0';

        await app.listen(port, host);

        logger.log(`Application successfully bootstrapped and listening on http://${host}:${port}`);
    } catch (error) {
        console.error('Fatal Initialization Error: Container failed to start due to a bootstrap exception.', error);
        process.exit(1);
    }
}
bootstrap();