import { Module, DynamicModule, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Global()
@Module({})
export class FirebaseModule {
    static forRoot(): DynamicModule {
        const app = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: 'contract-central-c710c',
            storageBucket: 'contract-central-c710c.firebasestorage.app',
        });

        return {
            module: FirebaseModule,
            providers: [
                { provide: 'FIREBASE_APP', useValue: app },
                { provide: 'FIRESTORE', useValue: admin.firestore() },
                { provide: 'FIREBASE_AUTH', useValue: admin.auth() },
                { provide: 'FIREBASE_BUCKET', useValue: admin.storage().bucket() },
            ],
            exports: ['FIREBASE_APP', 'FIRESTORE', 'FIREBASE_AUTH', 'FIREBASE_BUCKET'],
        };
    }
}
