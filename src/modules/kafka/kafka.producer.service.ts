import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaTopics } from './kafka-topics.enum';

@Injectable()
export class KafkaProducerService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      // Chỉ connect để sử dụng producer, không subscribe vì Building Service chỉ GỬI events
      await this.kafkaClient.connect();
    } catch (error) {
      console.warn(
        '⚠️ Kafka not available, skipping producer setup:',
        error.message,
      );
    }
  }

  // Building events
  async emitBuildingCreatedEvent(payload: any) {
    try {
      await this.kafkaClient.emit(KafkaTopics.BUILDING_CREATED, payload);
    } catch (error) {
      console.warn('⚠️ Failed to emit BUILDING_CREATED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }

  async emitBuildingUpdatedEvent(payload: any) {
    try {
      await this.kafkaClient.emit(KafkaTopics.BUILDING_UPDATED, payload);
    } catch (error) {
      console.warn('⚠️ Failed to emit BUILDING_UPDATED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }

  async emitBuildingDeletedEvent(payload: any) {
    try {
      await this.kafkaClient.emit(KafkaTopics.BUILDING_DELETED, payload);
    } catch (error) {
      console.warn('⚠️ Failed to emit BUILDING_DELETED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }
}
