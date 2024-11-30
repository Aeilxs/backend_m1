import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { Storage } from 'firebase-admin/lib/storage/storage';

@Injectable()
export class FirebaseService {
    private auth = admin.auth();
    private firestore = admin.firestore();
    private storage = admin.storage();

    getAuth(): Auth {
        return this.auth;
    }

    getFirestore() {
        return this.firestore;
    }

    getStorage(): Storage {
        return this.storage;
    }
}
