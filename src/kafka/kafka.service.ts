import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

    async sendMessage(topic: string, message: any) {
        console.log('h');
        return this.kafkaClient.emit(topic, message);
    }

    async onModuleInit() {
        await this.kafkaClient.connect();
    }
}
