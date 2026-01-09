import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api'); // Wszystkie endpointy będą miały prefix /api
    await app.listen(process.env.PORT || 8080);
}
bootstrap();
