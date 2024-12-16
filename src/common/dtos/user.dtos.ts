import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'jane', description: 'Firstname' })
    @IsString()
    firstname: string;

    @ApiProperty({ example: 'doe', description: 'Lastname' })
    @IsString()
    lastname: string;

    @ApiProperty({ example: 'test@example.com', description: 'Email address of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'mypassword', description: 'Password' })
    @IsString()
    @MinLength(6, { message: 'Password must be 6 chars length' })
    password: string;
}

export class UpdateUserDto {}
