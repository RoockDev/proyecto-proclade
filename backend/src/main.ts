import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync, mkdirSync } from 'node:fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadsDirectory = join(process.cwd(), 'uploads');

  if (!existsSync(uploadsDirectory)) {
    mkdirSync(uploadsDirectory, { recursive: true });
  }

  app.useStaticAssets(uploadsDirectory, {
    prefix: '/uploads',
  });
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
