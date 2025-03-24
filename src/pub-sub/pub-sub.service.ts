import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';

@Injectable()
export class PubSubService implements OnModuleInit {
    private readonly logger = new Logger(PubSubService.name);
    private readonly pubSubClient = new PubSub();

    private readonly topics = {
        coverageRequest: 'coverage-request',
        coverageResponse: 'coverage-response',
    };

    async onModuleInit() {
        this.logger.log('PubSubService initialized');
    }

    async publishMessage(topicName: string, data: object): Promise<string> {
        this.logger.log(`Publishing message to topic "${topicName}"`);

        try {
            const dataBuffer = Buffer.from(JSON.stringify(data));
            const messageId = await this.pubSubClient.topic(topicName).publish(dataBuffer);
            this.logger.log(`Message published to ${topicName} with ID: ${messageId}`);
            return messageId;
        } catch (error) {
            this.logger.error(`Error publishing message to ${topicName}: ${error.message}`, error.stack);
            throw new Error('Pub/Sub message publish failed');
        }
    }

    async subscribeMessages() {
        const subscription = this.pubSubClient.subscription('coverage-response-sub');
        subscription.on('message', (message) => {
            this.logger.log(`Message reçu : ${message.data.toString()}`);
            message.ack();
        });
    }
}
