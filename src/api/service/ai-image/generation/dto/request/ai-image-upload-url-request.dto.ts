import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class AiImageUploadUrlRequestDto {
    @ApiProperty({
        description: '업로드할 이미지 MIME 타입',
        enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        example: 'image/jpeg',
    })
    @IsString()
    @IsIn(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
    contentType: string;
}
