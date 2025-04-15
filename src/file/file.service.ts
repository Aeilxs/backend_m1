import {
    Inject,
    Injectable,
    Logger,
    HttpException,
    HttpStatus,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { Bucket, Storage } from '@google-cloud/storage';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { ApiResponseDto, FileUploadDto } from '@dtos';
import e from 'express';
import { FileCategory } from 'src/common/dtos/file-upload.dto';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    constructor(
        @Inject('FIREBASE_BUCKET') private readonly bucket: Bucket,
        private readonly pubSubService: PubSubService,
    ) {}

    async uploadFile(uid: string, file: Express.Multer.File, dto: FileUploadDto): Promise<string> {
        this.logger.log(`Uploading file for user ${uid}: ${dto.category}/${file.originalname}`);

        if (!dto.category) throw new BadRequestException('File category is required');

        if (!Object.values(FileCategory).includes(dto.category))
            throw new BadRequestException(`Invalid file category: ${dto.category}`);

        const destination = `users/${uid}/${dto.category}/${file.originalname}`;
        const blob = this.bucket.file(destination);

        try {
            const stream = blob.createWriteStream({
                resumable: false,
                contentType: file.mimetype,
            });

            stream.end(file.buffer);

            this.logger.log(`Successfully uploaded ${file.originalname} to ${destination}`);

            await this.pubSubService.publishMessage('file-upload', {
                user_uuid: uid,
                file_url: destination,
            });

            return destination;
        } catch (error) {
            this.logger.error(
                `Failed to upload file ${file.originalname} for user ${uid}: ${error.message}`,
                error.stack,
            );
            throw new Error('File upload failed');
        }
    }

    async getFileUrl(uid: string, fileName: string): Promise<string> {
        this.logger.log(`Generating temporary URL for file ${fileName} for user ${uid}`);
        const file = this.bucket.file(`users/${uid}/${fileName}`);

        try {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 10 * 60 * 1000, // 10min
            });
            return url;
        } catch (error) {
            this.logger.error('Error generating signed URL: ', error);
            throw new HttpException('Could not generate URL', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserFiles(uid: string): Promise<string[]> {
        this.logger.log(`Fetching files for user: ${uid}`);

        try {
            const [files] = await this.bucket.getFiles({ prefix: `users/${uid}/` });

            this.logger.log(`Found ${files.length} files for user ${uid}`);
            return files.map((f) => f.name);
        } catch (error) {
            this.logger.error(`Failed to fetch files for user ${uid}: ${error.message}`, error.stack);
            throw new Error('Error retrieving user files');
        }
    }

    async deleteFile(userId: string, fname: string) {
        this.logger.log(`Deleting file ${fname} for user ${userId}`);

        const file = this.bucket.file(`users/${userId}/${fname}`);
        const [exists] = await file.exists();

        if (!exists) throw new NotFoundException(`File ${fname} for user ${userId} not found`);

        try {
            await file.delete();
            await this.pubSubService.publishMessage('file-delete', {
                user_uuid: userId,
                file_url: `users/${userId}/${fname}`,
            });

            return new ApiResponseDto(HttpStatus.OK, `File ${fname} for user ${userId} deleted successfully`);
        } catch (error) {
            this.logger.error(`Error deleting file ${fname} for user ${userId}`, error);
            throw new HttpException('Failed to delete the file', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAllUserFiles(uid: string) {
        this.logger.log(`Deleting all files for user ${uid}`);

        try {
            const [files] = await this.bucket.getFiles({ prefix: `users/${uid}/` });

            if (files.length === 0) {
                return new ApiResponseDto(HttpStatus.OK, `No files found for user ${uid}`);
            }

            await Promise.all(
                files.map(async (file) => {
                    await file.delete();
                    this.logger.log(`Deleted file ${file.name}`);
                }),
            );

            await this.pubSubService.publishMessage('file-delete', {
                user_uuid: uid,
                file_url: '*',
            });

            return new ApiResponseDto(HttpStatus.OK, `All files for user ${uid} deleted successfully`);
        } catch (error) {
            this.logger.error(`Error deleting files for user ${uid}`, error);
            throw new HttpException('Failed to delete user files', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
