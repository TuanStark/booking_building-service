import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeocodingService } from './geocoding.service';


@Module({
  imports: [ConfigModule],
  providers: [GeocodingService],
  controllers: [], // optional
  exports: [GeocodingService], // để module khác inject
})
export class GeocodingModule {}