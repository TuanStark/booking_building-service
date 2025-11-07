import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBuildingDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(200)
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  images?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  longtitude?: string;

  @IsOptional()
  latitude?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  imagePublicId: string;
}
