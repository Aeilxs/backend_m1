import { IsEnum, IsNotEmpty } from 'class-validator';

export enum FileCategory {
    TMPIMG = 'TMPIMG',
    AUTO = 'AUTO',
    HOME = 'HOME',
    HEALTH = 'HEALTH',
    OTHER = 'OTHER',
}

export class FileUploadDto {
    @IsNotEmpty()
    @IsEnum(FileCategory)
    category: FileCategory;
}
