import { Module, DynamicModule } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Module({})
export class FirebaseModule {
    static forRoot(): DynamicModule {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            storageBucket: 'contract-central-c710c.firebasestorage.app',
        });

        return {
            module: FirebaseModule,
            providers: [FirebaseService],
            exports: [FirebaseService],
        };
    }
}
