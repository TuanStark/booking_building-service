import { Module } from '@nestjs/common';
import { KafkaProducerService } from './kafka.producer.service';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId:
                configService.get<string>('KAFKA_CLIENT_ID') ||
                'building-service',
              brokers: configService
                .get<string>('KAFKA_BROKER')
                ?.split(',') || ['localhost:9092'],
              retry: {
                retries: 3,
                initialRetryTime: 100,
                multiplier: 2,
              },
              requestTimeout: 30000,
              connectionTimeout: 3000,
            },
            producer: {
              allowAutoTopicCreation: true,
            },
            // Không cần consumer vì Building Service chỉ GỬI events, không NHẬN
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
