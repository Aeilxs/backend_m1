import { HttpException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { FileService } from './file/file.service';
import { UserService } from './user/user.service';
import { VertexAIService } from './vertex-ai/vertex-ai.service';
import { randomUUID } from 'crypto';
import { UserInfoDto } from './common/dtos/user.dtos';
import { PubSubService } from './pub-sub/pub-sub.service';
import { Firestore } from 'firebase-admin/firestore';
import { DashboardService } from './dashboard/dashboard.service';

@Injectable()
export class AppService {
    private readonly loggerService = new Logger(AppService.name);
    constructor(
        @Inject('FIRESTORE') private readonly firestore: Firestore,
        private readonly fileService: FileService,
        private readonly userService: UserService,
        private readonly vertexService: VertexAIService,
        private readonly pubSubService: PubSubService,
        private readonly dashboardService: DashboardService,
    ) {}

    async getAllUserInformations(uid: string) {
        this.loggerService.log(`Retrieving all user informations for user: ${uid}`);
        const profile = await this.userService.getUserInfo(uid);
        const files = await this.fileService.getUserFiles(uid);
        const dashboard = await this.dashboardService.buildDashboard(uid);
        return {
            profile: profile,
            files: files,
            dashboard: dashboard,
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

    async askCoverageQuery(uid: string, prompt: string): Promise<string> {
        const request_id = randomUUID();
        await this.firestore.collection('coverage_requests').doc(request_id).set({
            user_uuid: uid,
            user_query: prompt,
            status: 'pending',
            created_at: Date.now(),
        });

        await this.pubSubService.publishMessage('coverage-query', {
            user_uuid: uid,
            user_query: prompt,
            request_id,
        });

        return request_id;
    }

    async handleCoverageResponse(uid: string, request_id: string) {
        const ref = this.firestore.collection('coverage_requests').doc(request_id);
        const doc = await ref.get();

        if (!doc.exists) {
            throw new NotFoundException(`No response found for request_id ${request_id}`);
        }

        const data = doc.data();

        if (data.user_uuid !== uid) {
            throw new UnauthorizedException('You are not allowed to access this response.');
        }

        if (data.status !== 'done') {
            return { status: 'pending' };
        }

        return {
            status: 'done',
            response: data.response,
        };
    }
}
