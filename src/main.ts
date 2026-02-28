import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));
    const logger = app.get(Logger);

    // Security: Helmet for HTTP headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.google.com", "https://www.gstatic.com"],
                scriptSrcElem: ["'self'", "'unsafe-inline'", "https://www.google.com", "https://www.gstatic.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https://grainy-gradients.vercel.app"],
                frameSrc: ["'self'", "https://www.google.com", "https://www.recaptcha.net"],
                connectSrc: ["'self'", "ws:", "wss:", "https://www.google.com", "https://www.gstatic.com"],
            },
        },
    }));

    // Validation: Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strips properties that do not have decorators
        transform: true, // Automatically transforms payloads to be objects typed according to their DTO classes
        forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
    }));

    app.enableCors();
    app.setGlobalPrefix('api');

    // Graceful Shutdown for Cloud Run
    app.enableShutdownHooks();

    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');

    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Health check: ${await app.getUrl()}/api/health`);
}
bootstrap();
