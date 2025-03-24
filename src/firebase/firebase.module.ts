import { Module, DynamicModule, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'contract-central-c710c',
      storageBucket: 'contract-central-c710c.appspot.com',
    });

    console.log('[Firebase] Initialized with project:', app.options.projectId);

    return {
      module: FirebaseModule,
      providers: [
        { provide: 'FIREBASE_APP', useValue: app },
        { provide: 'FIRESTORE', useValue: admin.firestore() as Firestore },
        { provide: 'FIREBASE_AUTH', useValue: admin.auth() as Auth },
      ],
      exports: ['FIREBASE_APP', 'FIRESTORE', 'FIREBASE_AUTH'],
    };
  }
}