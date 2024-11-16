import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor() {}

    @ApiResponse({
        status: HttpStatus.OK,
        description: "Check if it's working",
    })
    @Get('test')
    async getHello(): Promise<string> {
        return "It's working !\n";
    }
}
