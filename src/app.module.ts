import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FirebaseModule.forRoot(require(process.env.FIREBASE_CONFIG_CREDENTIAL)),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
