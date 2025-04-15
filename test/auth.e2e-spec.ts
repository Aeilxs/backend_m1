import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    const mockFirebaseAuth = {
        createUser: jest.fn().mockResolvedValue({ uid: 'user123' }),
    };

    const mockPubSubService = {
        publishMessage: jest.fn(),
        onModuleInit: jest.fn(),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('FIREBASE_AUTH')
            .useValue(mockFirebaseAuth)
            .overrideProvider('PubSubService')
            .useValue(mockPubSubService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/auth/signin (POST)', async () => {
        const userDto = {
            firstname: 'Jean',
            lastname: 'Dupont',
            email: 'jean@example.com',
            password: 'secure123',
        };

        const res = await request(app.getHttpServer()).post('/auth/signin').send(userDto).expect(201);

        expect(res.body.data).toHaveProperty('uid', 'user123');
        expect(mockFirebaseAuth.createUser).toHaveBeenCalledWith({
            ...userDto,
            displayName: 'Jean Dupont',
        });
    });
});
