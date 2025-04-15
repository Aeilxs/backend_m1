import { FirebaseModule } from './firebase.module';
import * as admin from 'firebase-admin';

jest.mock('firebase-admin', () => {
    const firestore = jest.fn();
    const auth = jest.fn();
    const storage = () => ({
        bucket: jest.fn(),
    });

    const initializeApp = jest.fn().mockReturnValue({
        options: {
            projectId: 'contract-central-c710c',
            storageBucket: 'contract-central-c710c.firebasestorage.app',
        },
    });

    return {
        __esModule: true,
        initializeApp,
        credential: {
            applicationDefault: jest.fn(),
        },
        firestore,
        auth,
        storage,
    };
});

describe('FirebaseModule', () => {
    it('should provide all firebase tokens correctly', () => {
        const dynamicModule = FirebaseModule.forRoot();

        expect(dynamicModule.module).toBe(FirebaseModule);
        expect(dynamicModule.providers).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ provide: 'FIREBASE_APP' }),
                expect.objectContaining({ provide: 'FIRESTORE' }),
                expect.objectContaining({ provide: 'FIREBASE_AUTH' }),
                expect.objectContaining({ provide: 'FIREBASE_BUCKET' }),
            ]),
        );
        expect(dynamicModule.exports).toEqual(['FIREBASE_APP', 'FIRESTORE', 'FIREBASE_AUTH', 'FIREBASE_BUCKET']);
    });
});
