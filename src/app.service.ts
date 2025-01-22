import { Injectable, Logger } from '@nestjs/common';
import { FileService } from './file/file.service';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
    private readonly loggerService = new Logger(AppService.name);
    constructor(
        private readonly fileService: FileService,
        private readonly userService: UserService,
    ) {}

    async getAllUserInformations(uid: string) {
        this.loggerService.log('Retrieving all user informations for user: ', uid);
        const profile = await this.userService.getUserInfo(uid);
        const files = await this.fileService.getUserFiles(uid);
        return {
            profile: profile,
            files: files,
        };
    }
}
