import { Module, DynamicModule } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';

@Module({})
export class FirebaseModule {
    static forRoot(serviceAccount: admin.ServiceAccount): DynamicModule {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        return {
            module: FirebaseModule,
            providers: [FirebaseService],
            exports: [FirebaseService],
        };
    }
}
