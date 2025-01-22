// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { ClientKafka } from '@nestjs/microservices';

// @Injectable()
// export class KafkaService implements OnModuleInit, OnModuleDestroy {
//     constructor(private readonly kafkaClient: ClientKafka) {}

//     async onModuleInit() {
//         this.kafkaClient.subscribeToResponseOf('test-topic');
//         await this.kafkaClient.connect();
//     }

//     async onModuleDestroy() {
//         await this.kafkaClient.close();
//     }

//     listenToMessages() {
//         this.kafkaClient.send('test-topic', { key: 'test', value: { hello: 'world' } }).subscribe({
//             next: (message) => {
//                 console.log(`Received message: ${JSON.stringify(message)}`);
//             },
//             error: (err) => console.error('Error while consuming:', err),
//             complete: () => console.log('Consumption complete.'),
//         });
//     }
// }

import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
    constructor(@Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka) {}

    async onModuleInit() {
        this.kafkaClient.subscribeToResponseOf('test-topic');
        await this.kafkaClient.connect();
        console.log('Kafka client connected');
    }

    async onModuleDestroy() {
        await this.kafkaClient.close();
    }

    async sendMessage(topic: string, message: any) {
        try {
            console.log(`Sending message to topic ${topic}`);
            await this.kafkaClient.send(topic, message).toPromise();
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending Kafka message:', error);
        }
    }
}
