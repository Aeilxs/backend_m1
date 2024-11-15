import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private auth = admin.auth();
    private firestore = admin.firestore();

    async validateGoogleToken(token: string): Promise<admin.auth.DecodedIdToken> {
        return this.auth.verifyIdToken(token);
    }

    async getUser(uid: string): Promise<admin.auth.UserRecord> {
        return this.auth.getUser(uid);
    }

    async setData(collection: string, doc: string, data: any): Promise<void> {
        await this.firestore.collection(collection).doc(doc).set(data);
    }
}
