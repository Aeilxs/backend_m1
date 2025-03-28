import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    Delete,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ApiResponseDto } from '@dtos';

@ApiTags('files')
@Controller('files')
export class FileController {
    constructor(private readonly fileService: FileService) {}

    /**
     * POST /files/upload
     */
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a PDF file' })
    @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
    @ApiResponse({ status: 400, description: 'Only PDF files are accepted.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async uploadFile(@UploadedFile() file: Express.Multer.File, @User() u: DecodedIdToken): Promise<string> {
        return this.fileService.uploadFile(u.uid, file);
    }

    /**
     * GET /files/:fileName
     */
    @Get(':fileName')
    @ApiOperation({ summary: 'Get temporary URL for a file' })
    @ApiResponse({ status: 200, description: 'Temporary URL generated successfully.' })
    @ApiResponse({ status: 404, description: 'File not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getFileUrl(@Param('fileName') fname: string, @User() u: DecodedIdToken): Promise<string> {
        return this.fileService.getFileUrl(u.uid, fname);
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
    @Delete(':fileName')
    @ApiOperation({ summary: 'Delete a specific file for the user' })
    @ApiResponse({ status: 200, description: 'File deleted successfully.' })
    @ApiResponse({ status: 404, description: 'File not found.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deleteFile(@Param('fileName') fname: string, @User() u: DecodedIdToken) {
        return await this.fileService.deleteFile(u.uid, fname);
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
