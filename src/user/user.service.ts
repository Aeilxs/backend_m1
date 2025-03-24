import { Inject, Injectable, Logger } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { AuthService } from 'src/auth/auth.service';
import { UserInfoDto } from 'src/common/dtos/user.dtos';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @Inject('FIRESTORE') private readonly firestore: Firestore,
        private readonly authService: AuthService,
    ) {}

    async createUserInfo(uid: string, dto: UserInfoDto) {
        this.logger.log(`Creating user info for UID: ${uid}`);

        const authInfo = await this.authService.getUserByUid(uid);
        const [firstname, lastname] = authInfo.displayName?.split(' ') ?? ['', ''];

        dto.firstname = firstname;
        dto.lastname = lastname;
        dto.email = authInfo.email;

        this.logger.log(`Found firstname: '${firstname}' lastname: '${lastname}'`);

        const userRef = this.firestore.collection('users').doc(uid);
        try {
            await userRef.set({
                ...dto,
                createdAt: new Date(),
            });

            this.logger.log(`User info created for UID: ${uid}`);
            return { message: 'User info created successfully' };
        } catch (error) {
            this.logger.error(`Failed to create user info for UID: ${uid}`, error.stack);
            throw error;
        }
    }

    async updateUserInfo(uid: string, dto: UserInfoDto) {
        this.logger.log(`Updating user info for UID: ${uid}`);
        const userRef = this.firestore.collection('users').doc(uid);

        try {
            await userRef.set(
                {
                    ...dto,
                    updatedAt: new Date(),
                },
                { merge: true },
            );

            this.logger.log(`User info updated for UID: ${uid}`);
            return { message: 'User info updated successfully' };
        } catch (error) {
            this.logger.error(`Failed to update user info for UID: ${uid}`, error.stack);
            throw error;
        }
    }

    async getUserInfo(uid: string) {
        const userRef = this.firestore.collection('users').doc(uid);
        const doc = await userRef.get();
        return doc.exists ? doc.data() : null;
    }
}
