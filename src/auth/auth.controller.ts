import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@dtos';
import { ApiResponseDto } from '@dtos';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @ApiResponse({ status: HttpStatus.CREATED, description: 'New user created' })
    @Post('signin')
    async create(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserRecord>> {
        const userRecord = await this.authService.create(dto);
        return new ApiResponseDto(HttpStatus.CREATED, 'User created', userRecord);
    }
}
