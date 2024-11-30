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
        @User() user: DecodedIdToken,
    ): Promise<string> {
        return this.fileService.uploadFile(file, user.uid);
    }

    @Get(':userId/:fileName')
    async getFileUrl(
        @Param('userId') userId: string,
        @Param('fileName') fileName: string,
    ): Promise<string> {
        return this.fileService.getFileUrl(userId, fileName);
    }
}