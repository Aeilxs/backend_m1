import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/dtos';
import { Auth } from 'firebase-admin/auth';

describe('AuthService', () => {
    let service: AuthService;
    let mockAuth: jest.Mocked<Auth>;

    beforeEach(async () => {
        mockAuth = {
            createUser: jest.fn(),
            verifyIdToken: jest.fn(),
            getUser: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: 'FIREBASE_AUTH',
                    useValue: mockAuth,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should call createUser with full name', async () => {
        const dto: CreateUserDto = {
            email: 'john@example.com',
            password: 'securePass123',
            firstname: 'John',
            lastname: 'Doe',
        };

        mockAuth.createUser.mockResolvedValue({ uid: 'user123' } as any);

        const result = await service.create(dto);

        expect(mockAuth.createUser).toHaveBeenCalledWith({
            ...dto,
            displayName: 'John Doe',
        });
        expect(result).toEqual({ uid: 'user123' });
    });

    it('should verify token', async () => {
        mockAuth.verifyIdToken.mockResolvedValue({ uid: 'abc123' } as any);

        const result = await service.checkToken('fake-token');

        expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('fake-token');
        expect(result).toEqual({ uid: 'abc123' });
    });

    it('should get user by uid', async () => {
        mockAuth.getUser.mockResolvedValue({ uid: 'user321' } as any);

        const result = await service.getUserByUid('user321');

        expect(mockAuth.getUser).toHaveBeenCalledWith('user321');
        expect(result).toEqual({ uid: 'user321' });
    });
});
