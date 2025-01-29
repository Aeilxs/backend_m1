import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@dtos';
import { ApiResponseDto } from '@dtos';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public, User } from '@decorators';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * POST /auth/signin
     */
    @Public()
    @ApiResponse({ status: HttpStatus.CREATED, description: 'New user created' })
    @Post('signin')
    async create(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserRecord>> {
        const userRecord = await this.authService.create(dto);
        return new ApiResponseDto(HttpStatus.CREATED, 'User created', userRecord);
    }
}
