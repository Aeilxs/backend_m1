import { Controller, Get, Inject } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';

@Controller('pubsub-test')
export class PubSubTestController {
    constructor(@Inject(PubSubService) private readonly pubSubService: PubSubService) {}

    @Get('send')
    async sendMessage() {
        await this.pubSubService.publishMessage('coverage-query', { message: 'Test Pub/Sub' });
        return { success: true };
    }
}
