import { IsNumberString, IsNotEmpty } from 'class-validator';

export class ReverseGeocodeDto {
  @IsNumberString()
  @IsNotEmpty()
  latitude: string;

  @IsNumberString()
  @IsNotEmpty()
  longtitude: string;
}