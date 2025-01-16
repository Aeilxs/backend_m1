import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
    controllers: [UserController],
    providers: [UserService, FirebaseService, AuthService],
    exports: [UserService],
})
export class UserModule {}
