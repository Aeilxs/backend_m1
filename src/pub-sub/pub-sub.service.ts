import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PubSub } from '@google-cloud/pubsub';
import { Firestore } from 'firebase-admin/firestore';

@Injectable()
export class PubSubService implements OnModuleInit {
    private readonly logger = new Logger(PubSubService.name);
    private readonly pubSubClient = new PubSub();

    private readonly topics = {
        coverageQuery: 'coverage-query',
        coverageResponse: 'coverage-response',
        fileUpload: 'file-upload',
        fileDelete: 'file-delete',
    };

    constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {}

    async onModuleInit() {
        this.logger.log('Initializing PubSubService...');
        if (process.env.NODE_ENV !== 'test') this.subscribeToCoverageResponse();
    }

    async publishMessage(topicName: string, data: object): Promise<string> {
        this.logger.log(`Preparing to publish message to topic "${topicName}" with data: ${JSON.stringify(data)}`);

        try {
            const dataBuffer = Buffer.from(JSON.stringify(data));
            const messageId = await this.pubSubClient.topic(topicName).publish(dataBuffer);
            this.logger.log(`Message published to "${topicName}" with ID: ${messageId}`);
            return messageId;
        } catch (error) {
            this.logger.error(`Failed to publish message to "${topicName}": ${error.message}`, error.stack);
            throw new Error('Pub/Sub message publish failed');
        }
    }

    private subscribeToCoverageResponse() {
        const subscriptionName = 'coverage-response-sub';
        this.logger.log(`Subscribing to topic "${subscriptionName}"...`);

        const subscription = this.pubSubClient.subscription(subscriptionName);

        subscription.on('message', async (message) => {
            this.logger.log(`New message received on "${subscriptionName}": ${message.data.toString()}`);

            try {
                const payload = JSON.parse(message.data.toString());
                const { request_id, user_uuid, response: result } = payload;

                if (!request_id || !user_uuid || !result) {
                    this.logger.warn(`Missing expected fields in payload: ${JSON.stringify(payload)}`);
                    message.nack();
                    return;
                }

                this.logger.log(`Processing coverage response for request_id: ${request_id}, user_uuid: ${user_uuid}`);

                await this.firestore.collection('coverage_requests').doc(request_id).set({
                    user_uuid,
                    response: result,
                    status: 'done',
                    updated_at: Date.now(),
                });

                this.logger.log(`Firestore document updated for request_id: ${request_id}`);
                message.ack();
            } catch (error) {
                this.logger.error('Error handling coverage response message:', error.stack || error.message);
                message.nack();
            }
        });

        subscription.on('error', (err) => {
            this.logger.error(`Error on subscription "${subscriptionName}": ${err.message}`, err.stack);
        });

        this.logger.log(`Listening for messages on subscription "${subscriptionName}"`);
    }
}
