import { Injectable, Logger } from '@nestjs/common';
import { UserInfoDto } from 'src/common/dtos/user.dtos';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class UserService {
    private logger = new Logger(UserService.name);
    private readonly firestore = this.firebaseService.getFirestore();
    constructor(private readonly firebaseService: FirebaseService) {}

    async createUserInfo(uid: string, dto: UserInfoDto) {
        this.logger.log(`Creating user info for UID: ${uid}`);

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
        return (await userRef.get()).data();
    }
}
