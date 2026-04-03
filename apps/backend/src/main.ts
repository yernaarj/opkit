import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all REST routes
  app.setGlobalPrefix('api');

  // CORS — allow requests from the frontend dev server
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  // Global DTO validation via class-validator
  // whitelist: true          — strip unknown fields from incoming payloads
  // forbidNonWhitelisted: true — throw 400 when unknown fields are present
  // transform: true          — auto-cast plain objects to DTO class instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.BACKEND_PORT ?? 3000;
  await app.listen(port);

  console.log('Backend is running on: http://localhost:' + port + '/api');
}

bootstrap();
