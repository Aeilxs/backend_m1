import { Controller, Get } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { Public } from '@decorators';

@Controller('kafka')
export class KafkaController {
    constructor(private readonly kafkaService: KafkaService) {}

    @Get('send')
    @Public()
    async listenToMessages() {
        this.kafkaService.sendMessage('test-topic', {
            user: {
                id: '123456',
                name: 'John Doe',
                email: 'john.doe@example.com',
                preferences: {
                    language: 'en',
                    notifications: {
                        email: true,
                        sms: false,
                    },
                },
            },
            transaction: {
                id: 'tx78910',
                amount: 250.75,
                currency: 'USD',
                status: 'pending',
                items: [
                    { id: 'item1', name: 'Product A', quantity: 2, price: 50.0 },
                    { id: 'item2', name: 'Product B', quantity: 1, price: 150.75 },
                ],
            },
            metadata: {
                timestamp: new Date().toISOString(),
                source: 'nestjs-service',
                environment: process.env.NODE_ENV || 'development',
            },
        });
    }
}
