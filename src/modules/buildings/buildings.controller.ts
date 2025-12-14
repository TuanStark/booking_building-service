import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { BuildingService } from './buildings.service';
import { ResponseData } from 'src/common/global/globalClass';
import { HttpMessage } from 'src/common/global/globalEnum';
import { FindAllBuildingDto } from './dto/find-all.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createBuildingDto: CreateBuildingDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('file is required');
      }
      const building = await this.buildingService.create(
        createBuildingDto,
        file,
      );
      return new ResponseData(
        building,
        HttpStatus.ACCEPTED,
        HttpMessage.SUCCESS,
      );
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.NOT_FOUND,
        HttpMessage.NOT_FOUND,
      );
    }
  }

  @Get()
  async findAll(@Query() query: FindAllBuildingDto) {
    try {
      const building = await this.buildingService.findAll(query);
      return new ResponseData(building, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpMessage.SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const building = await this.buildingService.findOne(id);
      return new ResponseData(building, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpMessage.SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBuildingDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const building = await this.buildingService.update(id, dto, file);
      return new ResponseData(building, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpMessage.SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const building = await this.buildingService.remove(id);
      return new ResponseData(building, HttpStatus.OK, HttpMessage.SUCCESS);
    } catch (error) {
      return new ResponseData(
        null,
        HttpStatus.INTERNAL_SERVER_ERROR,
        HttpMessage.SERVER_ERROR,
      );
    }
  }
}
