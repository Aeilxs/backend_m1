import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { Public } from '@decorators';

@Controller()
export class AppController {
    constructor() {}

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
}
