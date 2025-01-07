import { Injectable } from '@nestjs/common';
import { FileService } from './file/file.service';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
    constructor(
        private readonly fileService: FileService,
        private readonly userService: UserService,
    ) {}
    async getAllUserInformations(uid: string) {
        const profile = await this.userService.getUserInfo(uid);
        const files = await this.fileService.getUserFiles(uid);
        console.log(files);
        return {
            profile: profile,
            files: files,
        };
    }
}
