import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

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

export enum Nationality {
    FRENCH = 'French',
    ENGLISH = 'English',
    AMERICAN = 'American',
    GERMAN = 'German',
    SPANISH = 'Spanish',
    OTHER = 'Other',
}

export enum MaritalStatus {
    SINGLE = 'single',
    MARRIED = 'married',
    DIVORCED = 'divorced',
    WIDOWED = 'widowed',
}

export class UserInfoDto {
    @ApiProperty({ example: 30, description: 'Age of the user' })
    @IsNumber()
    @IsOptional()
    age: number;

    @ApiProperty({
        example: MaritalStatus.SINGLE,
        description: 'Marital status of the user',
        enum: MaritalStatus,
    })
    @IsEnum(MaritalStatus)
    @IsOptional()
    maritalStatus: MaritalStatus;

    @ApiProperty({
        example: 'dog',
        description: 'Type of pet owned by the user (if any)',
        required: false,
    })
    @IsOptional()
    @IsString()
    pet?: string;

    @ApiProperty({ example: 'Jean' })
    @IsString()
    @IsOptional()
    firstname: string;

    @ApiProperty({ example: 'Jean' })
    @IsString()
    @IsOptional()
    lastname: string;

    @ApiProperty({ example: 'Radiologue', description: 'Profession of the user' })
    @IsString()
    @IsOptional()
    profession: string;

    @ApiProperty({ example: '0612345678', description: 'Phone number of the user' })
    @IsString()
    @IsOptional()
    telephone: string;

    @ApiProperty({
        example: Nationality.FRENCH,
        description: 'Nationality of the user',
        enum: Nationality,
    })
    @IsEnum(Nationality)
    @IsOptional()
    nationality: Nationality;

    @ApiProperty({ example: 1, description: 'User children count' })
    @IsNumber()
    @IsOptional()
    hasChildren: number;

    @ApiProperty({ example: 'Credit Agricole', description: "User's bank" })
    @IsString()
    @IsOptional()
    bank: string;

    @ApiProperty({ example: '3 rue des potiers', description: 'Address of the user' })
    @IsString()
    @IsOptional()
    address: string;
}
