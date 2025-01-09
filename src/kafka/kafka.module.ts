import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';

@Global()
@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'KAFKA_SERVICE',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: 'nestjs-client',
                        brokers: ['kafka:9092'],
                    },
                    consumer: {
                        groupId: 'nestjs-group',
                    },
                },
            },
        ]),
    ],
    providers: [KafkaService],
    exports: [KafkaService],
})
export class KafkaModule {}
