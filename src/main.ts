import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Tắt body parser mặc định để tự cấu hình
  });

  // Cấu hình body parser với giới hạn 100MB để hỗ trợ upload file ảnh lớn
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ extended: true, limit: '100mb' }));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());
  app.enableCors();
  await app.listen(process.env.PORT || 3002);
  console.log('Building service listening', process.env.PORT || 3002);
}
bootstrap();
