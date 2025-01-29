import { Injectable, Logger } from '@nestjs/common';
import { FileService } from './file/file.service';
import { UserService } from './user/user.service';
import { VertexAIService } from './vertex-ai/vertex-ai.service';
import { KafkaService } from './kafka/kafka.service';

@Injectable()
export class AppService {
    private readonly loggerService = new Logger(AppService.name);
    constructor(
        private readonly fileService: FileService,
        private readonly userService: UserService,
        private readonly vertexService: VertexAIService,
        private readonly kafkaService: KafkaService,
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

    async askGenerativeModel(uid: string, prompt: string) {
        this.loggerService.log('Asking generative model for user: ', uid);
        this.loggerService.log('Prompt: ', prompt);
        const files = await this.fileService.getUserFiles(uid);
        this.loggerService.log('Files: ', files);

        return this.vertexService.generateTextContent(prompt, files);
    }

    async askCoverageQuery(uid: string, prompt: string) {
        this.loggerService.log('Asking coverage query for user: ', uid);
        const r = await this.kafkaService.sendAndWait('coverage-query', { user_uuid: uid, user_query: prompt });
        this.loggerService.log('Coverage query response: ', r);
        return r;
    }
}
