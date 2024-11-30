import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';
import { CreateUserDto } from 'src/common/dtos';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly auth = this.firebaseService.getAuth();

    constructor(private readonly firebaseService: FirebaseService) {}

    async create(dto: CreateUserDto) {
        try {
            return await this.auth.createUser(dto);
        } catch (err) {
            this.logger.error("Couldn't create a new user");
            console.error(err);
            throw err;
        }
    }

    async checkToken(tok: string) {
        return await this.auth.verifyIdToken(tok);
    }
}
