import { User } from '@decorators';
import { Body, Controller, Patch, Post } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserInfoDto } from 'src/common/dtos/user.dtos';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    /**
     * POST /user/me
     */
    @Post('me')
    @ApiOperation({ summary: 'Create user information' })
    @ApiResponse({ status: 201, description: 'User information created successfully.' })
    @ApiResponse({ status: 400, description: 'Validation failed for user information.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: UserInfoDto, description: 'User information to create' })
    async createUserInfo(@User() u: DecodedIdToken, @Body() dto: UserInfoDto) {
        return await this.userService.createUserInfo(u.uid, dto);
    }

    /**
     * PATCH /user/me
     */
    @Patch('me')
    @ApiOperation({ summary: 'Update user information' })
    @ApiResponse({ status: 200, description: 'User information updated successfully.' })
    @ApiResponse({ status: 400, description: 'Validation failed for user information.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @ApiBody({ type: UserInfoDto, description: 'User information to update' })
    async updateUserInfo(@User() u: DecodedIdToken, @Body() dto: UserInfoDto) {
        return await this.userService.updateUserInfo(u.uid, dto);
    }

    /**
     * POST /user/contact
     */
    @Post('contact')
    async contactAdmin(@Body() dto: { email: string; message: string }) {
        // TODO
        return dto;
    }
}
