import { Controller, Post, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @User() u: DecodedIdToken,
    ): Promise<string> {
        return this.fileService.uploadFile(u.uid, file);
    }

    @Get(':fileName')
    async getFileUrl(
        @Param('fileName') fileName: string,
        @User() u: DecodedIdToken,
    ): Promise<string> {
        return this.fileService.getFileUrl(u.uid, fileName);
    }

    @Get()
    async getAllFiles(@User() u: DecodedIdToken) {
        return this.fileService.getUserFiles(u.uid);
    }
}
