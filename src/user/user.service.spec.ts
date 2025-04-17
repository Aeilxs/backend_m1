import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from 'src/auth/auth.service';
import { UserInfoDto } from 'src/common/dtos/user.dtos';
import { UserRecord } from 'firebase-admin/auth';

describe('UserService', () => {
    let service: UserService;
    let mockAuthService: jest.Mocked<AuthService>;
    let mockFirestore: any;
    let mockDocRef: any;

    beforeEach(async () => {
        mockAuthService = {
            getUserByUid: jest.fn(),
        } as any;

        mockDocRef = {
            set: jest.fn(),
            get: jest.fn(),
        };

        mockFirestore = {
            collection: jest.fn().mockReturnValue({
                doc: jest.fn().mockReturnValue(mockDocRef),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: 'FIRESTORE', useValue: mockFirestore },
                { provide: AuthService, useValue: mockAuthService },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create user info', async () => {
        const dto: UserInfoDto = {
            firstname: '',
            lastname: '',
            email: '',
            birthdate: '2000-01-01',
        } as unknown as UserInfoDto;

        const userRecordMock: Partial<UserRecord> = {
            uid: 'uid123',
            email: 'john@example.com',
            emailVerified: true,
            displayName: 'John Doe',
            disabled: false,
            metadata: {} as any,
            providerData: [],
            toJSON: () => ({}),
            multiFactor: {} as any,
            tenantId: null,
            photoURL: null,
            phoneNumber: null,
            customClaims: undefined,
        };

        mockAuthService.getUserByUid.mockResolvedValue(userRecordMock as UserRecord);

        await service.createUserInfo('uid123', { ...dto });

        expect(mockAuthService.getUserByUid).toHaveBeenCalledWith('uid123');
        expect(mockDocRef.set).toHaveBeenCalledWith(
            expect.objectContaining({
                firstname: 'John',
                lastname: 'Doe',
                email: 'john@example.com',
                createdAt: expect.any(Date),
            }),
        );
    });

    it('should update user info with merge', async () => {
        const dto: UserInfoDto = {
            firstname: 'Jane',
            lastname: 'Smith',
            email: 'jane@example.com',
        } as UserInfoDto;

        await service.updateUserInfo('uid456', dto);

        expect(mockDocRef.set).toHaveBeenCalledWith(
            expect.objectContaining({
                firstname: 'Jane',
                lastname: 'Smith',
                email: 'jane@example.com',
                updatedAt: expect.any(Date),
            }),
            { merge: true },
        );
    });

    it('should get user info if document exists', async () => {
        const data = { firstname: 'A', lastname: 'B' };
        mockDocRef.get.mockResolvedValue({ exists: true, data: () => data });

        const result = await service.getUserInfo('uid789');
        expect(result).toEqual(data);
    });

    it('should return null if document does not exist', async () => {
        mockDocRef.get.mockResolvedValue({ exists: false });

        const result = await service.getUserInfo('uid000');
        expect(result).toBeNull();
    });
});
