import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Public, User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AppService } from './app.service';
import { KafkaService } from './kafka/kafka.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly kafkaService: KafkaService,
    ) {}

    @ApiResponse({ status: HttpStatus.OK, description: "Check if it's working" })
    @Get('test')
    @Public()
    async getHello(): Promise<string> {
        this.kafkaService.sendMessage('myTopic', { key: 'myMessage' });
        return "It's workingzz !\n";
    }

    @Get('test/protected')
    async getProtectedHello(): Promise<string> {
        return 'Token ok !';
    }

    @Get('me')
    async getUserInformations(@User() u: DecodedIdToken) {
        return this.appService.getAllUserInformations(u.uid);
    }

    @MessagePattern('myTopic')
    handleMsg(@Payload() msg: any) {
        console.log('msg from kafka: ', msg.value);
    }
}
