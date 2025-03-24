import { Inject, Injectable, Logger } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';
import { CreateUserDto } from 'src/common/dtos';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(@Inject('FIREBASE_AUTH') private readonly auth: Auth) {}

    async create(dto: CreateUserDto) {
        try {
            const displayName = `${dto.firstname} ${dto.lastname}`;
            return await this.auth.createUser({ ...dto, displayName });
        } catch (err) {
            this.logger.error("Couldn't create a new user");
            console.error(err);
            throw err;
        }
    }

    async checkToken(tok: string) {
        this.logger.log(`Token received: ${tok}`);
        return await this.auth.verifyIdToken(tok);
    }

    async getUserByUid(uid: string) {
        return await this.auth.getUser(uid);
    }
}
