import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/dtos/user.dtos';
import { ApiResponseDto } from 'src/common/dtos/api-response.dto';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('signin')
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'User successfully created',
    })
    async create(@Body() dto: CreateUserDto): Promise<ApiResponseDto<UserRecord>> {
        const userRecord = await this.authService.create(dto);
        return new ApiResponseDto(HttpStatus.CREATED, 'User created', userRecord);
    }
}
