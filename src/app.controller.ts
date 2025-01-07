import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Public, User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @ApiResponse({ status: HttpStatus.OK, description: "Check if it's working" })
    @Get('test')
    @Public()
    async getHello(): Promise<string> {
        return "It's working !\n";
    }

    @Get('test/protected')
    async getProtectedHello(): Promise<string> {
        return 'Token ok !';
    }

    @Get('me')
    async getUserInformations(@User() u: DecodedIdToken) {
        return this.appService.getAllUserInformations(u.uid);
    }
}
