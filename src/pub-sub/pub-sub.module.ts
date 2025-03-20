import { Module } from '@nestjs/common';
import { PubSubService } from './pub-sub.service';
import { PubSubTestController } from './pub-sub.controller';

@Module({
    providers: [PubSubService],
    controllers: [PubSubTestController],
    exports: [PubSubService],
})
export class PubSubModule {}
