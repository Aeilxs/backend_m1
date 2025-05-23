import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Delete, Body } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { FileCategory } from 'src/common/dtos/file-upload.dto';

@ApiTags('files')
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    /**
     * POST /files/upload
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a PDF file with category' })
    @ApiConsumes('multipart/form-data')
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('category') category: FileCategory,
        @User() u: DecodedIdToken,
    ): Promise<string> {
        return this.fileService.uploadFile(u.uid, file, { category });
    }

    /**
     * GET /files/:fileCategory/:fileName
     */
    @Get(':fileCategory/:fileName')
    @ApiOperation({ summary: 'Get temporary URL for a file' })
    @ApiResponse({ status: 200, description: 'Temporary URL generated successfully.' })
    @ApiResponse({ status: 404, description: 'File not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getFileUrl(
        @Param('fileCategory') fcat: string,
        @Param('fileName') fname: string,
        @User() u: DecodedIdToken,
    ): Promise<string> {
        return this.fileService.getFileUrl(u.uid, fcat, fname);
    }

    /**
     * GET /files
     */
    @Get()
    @ApiOperation({ summary: 'List all files for the user' })
    @ApiResponse({ status: 200, description: 'List of files returned successfully.' })
    async getAllFiles(@User() u: DecodedIdToken) {
        return await this.fileService.getUserFiles(u.uid);
    }

    /**
     * DELETE /files/:fileName
     */
    @Delete(':category/:fileName')
    @ApiOperation({ summary: 'Delete a specific file for the user' })
    @ApiResponse({ status: 200, description: 'File deleted successfully.' })
    @ApiResponse({ status: 404, description: 'File not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deleteFile(@Param('fileName') fname: string, @User() u: DecodedIdToken, @Param('category') category: string) {
        return await this.fileService.deleteFile(u.uid, fname, category);
    }

    /**
     * DELETE /files
     */
    @Delete()
    @ApiOperation({ summary: 'Delete all files for the user' })
    @ApiResponse({ status: 200, description: 'All files deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deleteAllFile(@User() u: DecodedIdToken) {
        return await this.fileService.deleteAllUserFiles(u.uid);
    }
}
