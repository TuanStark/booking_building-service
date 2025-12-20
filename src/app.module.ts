import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { BuildingsModule } from './modules/buildings/buildings.module';
import { PrismaService } from 'nestjs-prisma';
import { KafkaModule } from './modules/kafka/kafka.module';
import { GeocodingModule } from './modules/geocoding/geocoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    BuildingsModule,
    KafkaModule,
    GeocodingModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
