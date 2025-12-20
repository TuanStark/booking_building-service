import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GeocodeRequest, GeocodeResponse } from '@googlemaps/google-maps-services-js';
import { GeocodeResult } from './interfaces/geocode-response.interface';

@Injectable()
export class GeocodingService {
  private readonly client: Client;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      throw new Error('Missing GOOGLE_MAPS_API_KEY');
    }
    this.client = new Client({});
  }

  async geocodeAddress(
    dto: { address: string; region?: string; language?: string },
  ): Promise<GeocodeResult | null> {
    try {
      const params: GeocodeRequest['params'] = {
        address: dto.address,
        key: this.configService.get<string>('GOOGLE_MAPS_API_KEY')!,
        region: dto.region,
        language: dto.language,
      };

      const response = await this.client.geocode({ params });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status} - ${response.data.error_message}`);
      }

      const result = response.data.results[0];
      if (!result) return null;

      return {
        formattedAddress: result.formatted_address,
        location: {
          latitude: result.geometry.location.lat,
          longtitude: result.geometry.location.lng,
        },
        placeId: result.place_id,
          types: result.types,
      };
    } catch (error: any) {
      console.error('[GeocodingService] Error:', error);
      throw new InternalServerErrorException('Geocoding service unavailable');
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
    try {
      const response = await this.client.reverseGeocode({
        params: {
          latlng: `${lat},${lng}`,
          key: this.configService.get<string>('GOOGLE_MAPS_API_KEY')!,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return result
        ? {
            formattedAddress: result.formatted_address,
            location: {
              latitude: result.geometry.location.lat,
              longtitude: result.geometry.location.lng,
            },
            placeId: result.place_id,
            types: result.types,
          }
        : null;
    } catch (error: any) {
      console.error('[GeocodingService] Reverse error:', error);
      throw new InternalServerErrorException('Reverse geocoding failed');
    }
  }
}