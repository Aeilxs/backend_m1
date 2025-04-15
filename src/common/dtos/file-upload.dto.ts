import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FileCategory {
    AUTO = 'AUTO',
    HABITATION = 'HABITATION',
    HEALTH = 'HEALTH',
    OTHER = 'OTHER',
}

export class FileUploadDto {
    @IsNotEmpty()
    @IsEnum(FileCategory)
    category: FileCategory;
}
