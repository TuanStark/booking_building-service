import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  region?: string; // e.g., 'vn'

  @IsString()
  @IsOptional()
  language?: string; // e.g., 'vi'
}