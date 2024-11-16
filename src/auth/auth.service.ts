import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateUserDto } from 'src/common/dtos/user.dtos';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(private readonly firebaseService: FirebaseService) {}

    async create(dto: CreateUserDto) {
        const auth = this.firebaseService.getAuth();
        try {
            this.logger.log('User created');
            return await auth.createUser(dto);
        } catch (error) {
            this.logger.error("Couldn't create a new user");
            console.error(error);
            throw error;
        }
    }
}
