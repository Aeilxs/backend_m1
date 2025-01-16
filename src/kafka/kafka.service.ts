import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

    async sendMessage(topic: string, message: any) {
        return this.kafkaClient.emit(topic, message);
    }

    async onModuleInit() {
        await this.kafkaClient.connect();
    }
}
