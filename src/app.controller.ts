import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './firebase/firebase.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly firebaseService: FirebaseService,
    ) {}

    @Get()
    async getHello(): Promise<string> {
        await this.firebaseService.setData('testCollection', 'testDoc', { message: 'testContent' });
        return this.appService.getHello();
    }
}
