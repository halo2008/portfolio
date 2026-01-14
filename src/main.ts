import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.setGlobalPrefix('api'); // Wszystkie endpointy będą miały prefix /api
    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
}
bootstrap();
