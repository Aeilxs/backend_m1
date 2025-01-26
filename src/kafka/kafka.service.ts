import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('test-topic');
        await this.kafkaClient.connect();
    }

    async onModuleDestroy() {
        await this.kafkaClient.close();
    }

    async emitMessage(topic: string, message: any) {
        try {
            console.log(`Sending message to topic ${topic}`);
            await this.kafkaClient.emit(topic, message).toPromise();
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending Kafka message:', error);
        }
    }
}
