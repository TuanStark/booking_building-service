import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { FindAllDto } from 'src/common/global/find-all.dto';

export class FindAllBuildingDto extends PartialType(FindAllDto) {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    country?: string;

    @IsOptional()
    city?: string;
}