import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { KafkaController } from './kafka-test.controller';

@Global()
@Module({})
export class KafkaModule {
    static register(): DynamicModule {
        return {
            module: KafkaModule,
            imports: [
                ClientsModule.registerAsync([
                    {
                        name: 'KAFKA_SERVICE',
                        useFactory: () => ({
                            transport: Transport.KAFKA,
                            options: {
                                client: {
                                    clientId: process.env.KAFKA_CLIENT_ID || 'nestjs-client',
                                    brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
                                },
                                consumer: {
                                    groupId: process.env.KAFKA_GROUP_ID || 'nestjs-group',
                                    allowAutoTopicCreation: true,
                                    groupInstanceId: process.env.INSTANCE_ID || 'nestjs-instance-1',
                                },
                            },
                        }),
                    },
                ]),
            ],
            providers: [KafkaService],
            controllers: [KafkaController],
            exports: [KafkaService],
        };
    }
}
