import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { Bucket, File } from '@google-cloud/storage';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiResponseDto } from '@dtos';

describe('FileService', () => {
    let service: FileService;
    let mockBucket: jest.Mocked<Bucket>;
    let mockPubSubService: jest.Mocked<PubSubService>;
    let mockFile: jest.Mocked<Partial<File>>;

    beforeEach(async () => {
        mockPubSubService = {
            publishMessage: jest.fn(),
        } as any;

        mockFile = {
            createWriteStream: jest.fn().mockReturnValue({ end: jest.fn() }),
            getSignedUrl: jest.fn().mockResolvedValue(['https://signed.url']),
            delete: jest.fn(),
            exists: jest.fn().mockResolvedValue([true]),
            name: 'fakefile.jpg',
        };

        mockBucket = {
            file: jest.fn().mockReturnValue(mockFile as unknown as File),
            getFiles: jest.fn().mockResolvedValue([
                [
                    { name: 'users/user1/file1.txt', delete: jest.fn() },
                    { name: 'users/user1/file2.txt', delete: jest.fn() },
                ],
            ]),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileService,
                { provide: 'FIREBASE_BUCKET', useValue: mockBucket },
                { provide: PubSubService, useValue: mockPubSubService },
            ],
        }).compile();

        service = module.get<FileService>(FileService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should upload a file and publish event', async () => {
        const file = {
            originalname: 'image.png',
            mimetype: 'image/png',
            buffer: Buffer.from('123'),
        } as Express.Multer.File;

        await service.uploadFile('user1', file);

        expect(mockBucket.file).toHaveBeenCalledWith('users/user1/image.png');
        expect(mockPubSubService.publishMessage).toHaveBeenCalledWith('file-upload', {
            user_uuid: 'user1',
            file_url: 'users/user1/image.png',
        });
    });

    it('should generate signed URL', async () => {
        const url = await service.getFileUrl('user1', 'image.png');
        expect(mockBucket.file).toHaveBeenCalledWith('users/user1/image.png');
        expect(url).toEqual('https://signed.url');
    });

    it('should return list of user files', async () => {
        const files = await service.getUserFiles('user1');
        expect(files).toEqual(['users/user1/file1.txt', 'users/user1/file2.txt']);
    });

    it('should delete a file if it exists', async () => {
        const result = await service.deleteFile('user1', 'file1.txt');
        expect(result).toEqual(new ApiResponseDto(HttpStatus.OK, `File file1.txt for user user1 deleted successfully`));
        expect(mockPubSubService.publishMessage).toHaveBeenCalled();
    });

    it('should throw if file does not exist', async () => {
        (mockFile.exists as jest.Mock).mockResolvedValue([false]);

        await expect(service.deleteFile('user1', 'missing.txt')).rejects.toThrow(NotFoundException);
    });

    it('should delete all user files', async () => {
        const result = await service.deleteAllUserFiles('user1');
        expect(result).toEqual(new ApiResponseDto(HttpStatus.OK, `All files for user user1 deleted successfully`));
        expect(mockPubSubService.publishMessage).toHaveBeenCalledWith('file-delete', {
            user_uuid: 'user1',
            file_url: '*',
        });
    });
});
