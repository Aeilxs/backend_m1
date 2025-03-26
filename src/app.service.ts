import { HttpException, Injectable, Logger } from '@nestjs/common';
import { FileService } from './file/file.service';
import { UserService } from './user/user.service';
import { VertexAIService } from './vertex-ai/vertex-ai.service';
// import { KafkaService } from './kafka/kafka.service';
import { randomUUID } from 'crypto';
import { UserInfoDto } from './common/dtos/user.dtos';
import { PubSubService } from './pub-sub/pub-sub.service';

@Injectable()
export class AppService {
    private readonly loggerService = new Logger(AppService.name);
    constructor(
        private readonly fileService: FileService,
        private readonly userService: UserService,
        private readonly vertexService: VertexAIService,
        private readonly pubSubService: PubSubService,
        // private readonly kafkaService: KafkaService,
    ) {}

    async getAllUserInformations(uid: string) {
        this.loggerService.log(`Retrieving all user informations for user: ${uid}`);
        const profile = await this.userService.getUserInfo(uid);
        const files = await this.fileService.getUserFiles(uid);
        return {
            profile: profile,
            files: files,
        };
    }

    async askGenerativeModel(uid: string, prompt: string) {
        this.loggerService.log(`Asking generative model for user: ${uid}`);
        const files = await this.fileService.getUserFiles(uid);
        if (files.length === 0) {
            throw new HttpException('Add files before requesting AI.', 404);
        }

        return this.vertexService.generateTextContent(
            uid,
            prompt,
            files,
            (await this.userService.getUserInfo(uid)) as UserInfoDto,
        );
    }

    async askCoverageQuery(uid: string, prompt: string) {
        this.loggerService.log(`Asking coverage query for user: ${uid}`);
        const request_id = randomUUID();
        this.pubSubService.publishMessage('coverage-query', { user_uuid: uid, user_query: prompt, request_id });
        return request_id;
    }

    // TODO
    async handleCoverageResponse(uid: string, requestId: string) {
        this.loggerService.log(`Handling coverage response for request: ${requestId}`);
        // const r = this.kafkaService.getCoverageResponse(requestId);
        // if (r === undefined) {
        //     throw new HttpException(`No response for request id ${requestId}`, 404);
        // }

        // if (r.user_uuid !== uid) {
        //     throw new HttpException(
        //         "Unauthorized (user trying to retrieve a response that doesn't belong to him)",
        //         401,
        //     );
        // }

        // return r;
    }
}
