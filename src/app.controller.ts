import { Controller, Get, HttpStatus, Logger, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public, User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { AppService } from './app.service';
// import { Service } from './kafka/kafka.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PubSubService } from './pub-sub/pub-sub.service';

@Controller()
export class AppController {
    private readonly loggerService = new Logger(AppController.name);
    constructor(
        private readonly appService: AppService,
        // private readonly kafkaService: KafkaService,
        private readonly pubSubService: PubSubService,
    ) {}

    /**
     * GET /test
     */
    @ApiOperation({ summary: 'Check if the API is running' })
    @ApiResponse({ status: HttpStatus.OK, description: 'API is operational' })
    @Get('test')
    @Public()
    async getHello(): Promise<string> {
        return "It's workingzz !\n";
    }

    /**
     *  GET /test/protected
     */
    @Get('test/protected')
    @ApiOperation({ summary: 'Check if authentication is working' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Token validation successful.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async getProtectedHello(): Promise<string> {
        return 'Token ok !';
    }

    /**
     * GET /me
     */
    @Get('me')
    @ApiOperation({ summary: 'Get user informations' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User informations retrieved successfully.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async getUserInformations(@User() u: DecodedIdToken) {
        return this.appService.getAllUserInformations(u.uid);
    }

    /**
     * GET /ai/generate-text
     */
    @Get('ai/generate-text')
    @ApiOperation({ summary: 'Generate text using AI' })
    @ApiResponse({ status: HttpStatus.OK, description: 'AI response generated successfully.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async askGenerativeModel(@User() u: DecodedIdToken, @Query('prompt') prompt: string) {
        return this.appService.askGenerativeModel(u.uid, prompt);
    }

    /**
     * POST /ai/coverage-query
     */
    @Post('ai/coverage-query')
    @ApiOperation({ summary: 'Submit a coverage query to AI, return an UUID used to retrieve the response later on.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Query processed successfully.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async askCoverageQuery(@User() u: DecodedIdToken, @Query('prompt') prompt: string) {
        return this.appService.askCoverageQuery(u.uid, prompt);
    }

    /**
     * GET /ai/coverage-response
     */
    @Get('ai/coverage-response')
    @ApiOperation({ summary: 'Retrieve AI coverage response' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Response retrieved successfully.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found.' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async handleCoverageResponse(@User() u: DecodedIdToken, @Query('request_id') requestId: string) {
        try {
            return this.appService.handleCoverageResponse(u.uid, requestId);
        } catch (err) {
            this.loggerService.error(err.message, err.stack);
            throw err;
        }
    }
}
