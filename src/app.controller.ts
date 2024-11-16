import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor(
    ) {}

    @Get("test")
    async getHello(): Promise<string> {
       return "It's working !\n"
    }
}
