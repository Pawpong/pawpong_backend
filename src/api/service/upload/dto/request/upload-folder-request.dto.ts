import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFolderRequestDto {
    @ApiPropertyOptional({
        description: '업로드할 폴더 경로',
        example: 'profiles',
    })
    @IsOptional()
    @IsString()
    folder?: string;
}
