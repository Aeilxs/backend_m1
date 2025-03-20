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

    async publishMessage(topic: string, message: any) {
        const buf = Buffer.from(JSON.stringify(message));
        await this.pubSubClient.topic(topic).publishMessage({ data: buf });
        this.logger.log(`Message publié sur ${topic}`);
    }

    async subscribeMessages() {
        const subscription = this.pubSubClient.subscription('coverage-response-sub');
        subscription.on('message', (message) => {
            this.logger.log(`Message reçu : ${message.data.toString()}`);
            message.ack();
        });
    }
}
