import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class FileService {
    private bucket = this.firebaseService.getBucket();

    constructor(private readonly firebaseService: FirebaseService) {}

    // Upload un fichier
    async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
        const fileUpload = this.bucket.file(`users/${userId}/${file.originalname}`);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            },
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (err) => reject(err));
            stream.on('finish', () => {
                // Retourner l'URL publique ou le chemin du fichier
                resolve(`users/${userId}/${file.originalname}`);
            });

            stream.end(file.buffer);
        });
    }

    // Récupérer un fichier depuis Firebase Storage
    async getFileUrl(userId: string, fileName: string): Promise<string> {
        const file = this.bucket.file(`users/${userId}/${fileName}`);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // Le lien est valable pendant une durée très longue
        });
        return url;
    }
}
