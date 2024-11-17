import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
    imports: [FirebaseModule],
    providers: [AuthService, FirebaseService],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
