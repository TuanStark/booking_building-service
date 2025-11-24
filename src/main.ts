import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // NestJS will handle body parsing automatically, including multipart/form-data
  // when using FileInterceptor in controllers

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());
  app.enableCors();
  await app.listen(process.env.PORT || 3002);
  console.log('Building service listening', process.env.PORT || 3002);
}
bootstrap();
