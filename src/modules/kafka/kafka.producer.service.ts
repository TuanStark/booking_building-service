import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';
import { KafkaTopics } from './kafka-topics.enum';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const kafkaBroker = configService.get<string>('KAFKA_BROKER') || 'kafka:9092';
    const clientId = configService.get<string>('KAFKA_CLIENT_ID') || 'building-service';

    console.log('🔧 [Kafka Producer] Initializing Kafka Producer (NO CONSUMER)');
    console.log(`📡 KAFKA_BROKER: ${kafkaBroker}`);
    console.log(`🆔 KAFKA_CLIENT_ID: ${clientId}`);

    this.kafka = new Kafka({
      clientId,
      brokers: kafkaBroker.split(','),
      retry: {
        retries: 3,
        initialRetryTime: 100,
        multiplier: 2,
      },
      requestTimeout: 30000,
      connectionTimeout: 3000,
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });
  }

  async onModuleInit() {
    try {
      console.log('🔗 [Kafka Producer] Connecting to Kafka (PRODUCER ONLY - NO CONSUMER)...');
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ [Kafka Producer] Successfully connected to Kafka (producer mode only)');
    } catch (error) {
      console.warn(
        '⚠️ [Kafka Producer] Kafka not available, skipping producer setup:',
        error.message,
      );
      console.warn('⚠️ [Kafka Producer] Building service will continue without Kafka events');
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected && this.producer) {
      try {
        console.log('🔌 [Kafka Producer] Disconnecting producer...');
        await this.producer.disconnect();
        console.log('✅ [Kafka Producer] Producer disconnected');
      } catch (error) {
        console.warn('⚠️ [Kafka Producer] Error disconnecting producer:', error.message);
      }
    }
  }

  // Building events
  async emitBuildingCreatedEvent(payload: any) {
    if (!this.isConnected) {
      console.warn('⚠️ [Kafka Producer] Producer not connected, skipping BUILDING_CREATED event');
      return;
    }

    try {
      console.log('📤 [Kafka Producer] Emitting BUILDING_CREATED event:', payload);
      await this.producer.send({
        topic: KafkaTopics.BUILDING_CREATED,
        messages: [
          {
            value: JSON.stringify(payload),
          },
        ],
      });
      console.log('✅ [Kafka Producer] BUILDING_CREATED event sent successfully');
    } catch (error) {
      console.warn('⚠️ [Kafka Producer] Failed to emit BUILDING_CREATED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }

  async emitBuildingUpdatedEvent(payload: any) {
    if (!this.isConnected) {
      console.warn('⚠️ [Kafka Producer] Producer not connected, skipping BUILDING_UPDATED event');
      return;
    }

    try {
      console.log('📤 [Kafka Producer] Emitting BUILDING_UPDATED event:', payload);
      await this.producer.send({
        topic: KafkaTopics.BUILDING_UPDATED,
        messages: [
          {
            value: JSON.stringify(payload),
          },
        ],
      });
      console.log('✅ [Kafka Producer] BUILDING_UPDATED event sent successfully');
    } catch (error) {
      console.warn('⚠️ [Kafka Producer] Failed to emit BUILDING_UPDATED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }

  async emitBuildingDeletedEvent(payload: any) {
    if (!this.isConnected) {
      console.warn('⚠️ [Kafka Producer] Producer not connected, skipping BUILDING_DELETED event');
      return;
    }

    try {
      console.log('📤 [Kafka Producer] Emitting BUILDING_DELETED event:', payload);
      await this.producer.send({
        topic: KafkaTopics.BUILDING_DELETED,
        messages: [
          {
            value: JSON.stringify(payload),
          },
        ],
      });
      console.log('✅ [Kafka Producer] BUILDING_DELETED event sent successfully');
    } catch (error) {
      console.warn('⚠️ [Kafka Producer] Failed to emit BUILDING_DELETED event:', error.message);
      // Không throw error để không ảnh hưởng đến flow chính
    }
  }
}
