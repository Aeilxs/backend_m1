import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    private pendingRequests = new Map<string, (value: any) => void>();

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

    async sendAndWait(topic: string, message: any, timeout = 10000): Promise<any> {
        const request_id = randomUUID();
        const payload = { ...message, request_id };
        console.log('payload: ', payload);

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(request_id);
                reject(new Error('Kafka response timeout'));
            }, timeout);

            this.pendingRequests.set(request_id, (data) => {
                clearTimeout(timer);
                resolve(data);
            });

            this.kafkaClient.emit(topic, payload).subscribe({
                error: (err) => {
                    clearTimeout(timer);
                    this.pendingRequests.delete(request_id);
                    reject(err);
                },
            });
        });
    }

    private handleKafkaResponse(message: any) {
        try {
            const value = JSON.parse(message.value.toString());
            const { request_id, data } = value;

            if (this.pendingRequests.has(request_id)) {
                this.pendingRequests.get(request_id)(data);
                this.pendingRequests.delete(request_id);
            }
        } catch (error) {
            console.error('Error processing Kafka response:', error);
        }
    }
}
