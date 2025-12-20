import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { KafkaProducerService } from '../kafka/kafka.producer.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/utils/uploads.service';
import { FindAllBuildingDto } from './dto/find-all.dto';
import { GeocodingService } from '../geocoding/geocoding.service';

@Injectable()
export class BuildingService {
  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducerService,
    private readonly uploadService: UploadService,
    private readonly geocodingService: GeocodingService,
  ) { }

  async create(dto: CreateBuildingDto, file?: Express.Multer.File) {
    const geocodingResult = await this.geocodingService.geocodeAddress({ address: dto.address });
    if (!geocodingResult) {
      throw new BadRequestException('Geocoding failed');
    }
    const { latitude, longtitude } = geocodingResult.location;
    console.log(latitude, longtitude);
    try {
      let imageUrl = null;
      let imagePublicId = null;

      // Chỉ upload ảnh nếu có file
      if (file) {
        const uploadResult = await this.uploadService.uploadImage(file);
        imageUrl = uploadResult.imageUrl;
        imagePublicId = uploadResult.imagePublicId;
      }

      // Lưu vào database
      const building = await this.prisma.building.create({
        data: {
          name: dto.name,
          address: dto.address,
          latitude: latitude?.toString(),
          longtitude: longtitude?.toString(),
          city: dto.city,
          country: dto.country,
          description: dto.description,
          images: imageUrl, // Có thể null nếu không có file
          imagePublicId: imagePublicId, // Có thể null nếu không có file
        },
      });

      // Emit Kafka event
      await this.kafkaProducer.emitBuildingCreatedEvent(building);

      return building;
    } catch (error) {
      throw new HttpException(
        `Failed to create building: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async findAll(query: FindAllBuildingDto) {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (pageNumber < 1 || limitNumber < 1) {
      throw new Error('Page and limit must be greater than 0');
    }

    const take = limitNumber;
    const skip = (pageNumber - 1) * take;

    const searchUpCase = search.charAt(0).toUpperCase() + search.slice(1);
    const where = search
      ? {
        OR: [
          { name: { contains: searchUpCase } },
          { address: { contains: searchUpCase } },
        ],
      }
      : {};
    const orderBy = {
      [sortBy]: sortOrder,
    };

    const [buildings, total] = await Promise.all([
      this.prisma.building.findMany({
        where: where,
        orderBy: orderBy,
        skip,
        take,
      }),
      this.prisma.building.count({
        where: where,
      }),
    ]);

    return {
      data: buildings,
      meta: {
        total,
        pageNumber,
        limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: string) {
    const building = await this.prisma.building.findUnique({ where: { id } });
    if (!building) throw new NotFoundException('Building not found');
    return building;
  }

  async update(id: string, dto: UpdateBuildingDto, file?: Express.Multer.File) {
    try {
      // Lấy building hiện tại
      const existing = await this.prisma.building.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new HttpException(`Building not found`, 404);
      }

      let url = existing.images;
      let public_id = existing.imagePublicId;

      if (file) {
        // Upload ảnh mới
        const { imageUrl, imagePublicId } =
          await this.uploadService.uploadImage(file);
        url = imageUrl;
        public_id = imagePublicId;

        // TODO: Xoá ảnh cũ nếu cần (upload-service chưa expose DELETE endpoint)
      }

      const building = await this.prisma.building.update({
        where: { id },
        data: {
          ...dto,
          images: url,
          imagePublicId: public_id,
        },
      });

      // Emit Kafka event
      await this.kafkaProducer.emitBuildingUpdatedEvent(building);

      return building;
    } catch (error: any) {
      throw new HttpException(
        `Failed to update building: ${error.message}`,
        error.response?.status || 500,
      );
    }
  }

  async remove(id: string) {
    await this.prisma.building.delete({ where: { id } });
    await this.kafkaProducer.emitBuildingDeletedEvent({ id });
    return { message: 'Building deleted successfully' };
  }
}
