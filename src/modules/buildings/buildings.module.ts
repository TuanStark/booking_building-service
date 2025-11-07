import { Module } from '@nestjs/common';
import { BuildingController } from './buildings.controller';
import { BuildingService } from './buildings.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UploadService } from 'src/utils/uploads.service';
import { KafkaModule } from '../kafka/kafka.module';

@Module({
  imports: [
    PrismaModule,
    KafkaModule,
    MulterModule.register({
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  ],
  controllers: [BuildingController],
  providers: [BuildingService, PrismaService, UploadService],
})
export class BuildingsModule {}
