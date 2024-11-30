import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { Storage } from 'firebase-admin/lib/storage/storage';

@Injectable()
export class FirebaseService {
    private auth = admin.auth();
    private firestore = admin.firestore();
    private storage = admin.storage().bucket(process.env.FIREBASE_CONFIG_BUCKET);

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
