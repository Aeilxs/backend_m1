import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        example: 'test@example.com', // Exemple pour Swagger
        description: 'Email address of the user', // Description affichée dans Swagger
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'mypassword',
        description: 'Password',
    })
    @IsString()
    @MinLength(6, { message: 'Password must be 6 chars length' })
    password: string;
}
