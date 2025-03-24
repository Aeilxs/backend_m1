import { Inject, Injectable, Logger, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Bucket, Storage } from '@google-cloud/storage';
import { PubSubService } from 'src/pub-sub/pub-sub.service';
import { ApiResponseDto } from '@dtos';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly bucket: Bucket;

  constructor(
    @Inject('FIREBASE_STORAGE') private readonly storage: Storage,
    @Inject('FIREBASE_BUCKET_NAME') private readonly bucketName: string,
    private readonly pubSubService: PubSubService,
  ) {
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async uploadFile(userId: string, file: Express.Multer.File): Promise<string> {
    this.logger.log(`Uploading file for user ${userId}`);

    if (file.mimetype !== 'application/pdf') {
      throw new HttpException('Only PDF are accepted', HttpStatus.BAD_REQUEST);
    }

    const fileUpload = this.bucket.file(`users/${userId}/${file.originalname}`);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (err) => reject(err));
      stream.on('finish', async () => {
        const fileUrl = `users/${userId}/${file.originalname}`;
        await this.pubSubService.publishMessage('file-upload', {
          user_uuid: userId,
          file_url: fileUrl,
        });
        resolve(fileUrl);
      });

      stream.end(file.buffer);
    });
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
      this.logger.error('Error generating signed URL', error);
      throw new HttpException('Could not generate URL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserFiles(uid: string): Promise<string[]> {
    this.logger.log(`Getting all files for user ${uid}`);

    const [files] = await this.bucket.getFiles({ prefix: `users/${uid}/` });
    return files.map((f) => f.name);
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