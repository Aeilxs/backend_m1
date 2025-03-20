import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Auth } from 'firebase-admin/lib/auth/auth';

@Injectable()
export class FirebaseService {
    private auth = admin.auth();
    private firestore = admin.firestore();
    private storage = admin.storage().bucket('contract-central-c710c.firebasestorage.app');

    getAuth(): Auth {
        return this.auth;
    }

    getFirestore() {
        return this.firestore;
    }

    getBucket() {
        return this.storage;
    }
}
