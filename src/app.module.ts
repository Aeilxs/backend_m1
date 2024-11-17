import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        FirebaseModule.forRoot(require(process.env.FIREBASE_CONFIG_CREDENTIAL)),
        AuthModule,
    ],
    controllers: [AppController],
})
export class AppModule {}
