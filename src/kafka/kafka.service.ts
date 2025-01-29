import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private logger = new Logger(KafkaService.name);
    private coverageResponses = new Map<string, any>();

    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('coverage-response');
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

    getCoverageResponse(requestId: string): any {
        const r = this.coverageResponses.get(requestId);
        if (r === 'undefined') {
            return `No response for request id ${requestId}`;
        }
        return r;
    }

    setCoverageResponse(requestId: string, response: any) {
        this.coverageResponses.set(requestId, response);
    }
}
