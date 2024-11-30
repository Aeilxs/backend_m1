import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class FileService {
    private logger = new Logger(FileService.name);
    private bucket = this.firebaseService.getBucket();

    constructor(private readonly firebaseService: FirebaseService) {}

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
            stream.on('finish', () => {
                resolve(`users/${userId}/${file.originalname}`);
            });

            stream.end(file.buffer);
        });
    }

    // Récupérer un fichier depuis Firebase Storage
    async getFileUrl(userId: string, fileName: string): Promise<string> {
        this.logger.log(`Generating temporary URL for file ${fileName} for user ${userId}`);

        const file = this.bucket.file(`users/${userId}/${fileName}`);

        try {
            const [url] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 10 * 60 * 1000, // 10min
            });

            return url;
        } catch (error) {
            this.logger.error('Error generating signed URL', error);
        }
    }
}
