import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
    AI_IMAGE_ADMIN_ASSET_PURPOSES,
    type AiImageAdminAssetPurpose,
} from '../../../../service/ai-image/shared/domain/services/ai-image-object-key.service';

/** 어드민 필터 애셋 업로드 URL 발급 요청 */
export class AiImageAdminUploadUrlRequestDto {
    @ApiProperty({
        description: '업로드 용도 (thumbnail: 필터 썸네일, reference: 스타일 레퍼런스, source: 미리보기 원본)',
        enum: AI_IMAGE_ADMIN_ASSET_PURPOSES,
        example: 'thumbnail',
    })
    @IsIn(AI_IMAGE_ADMIN_ASSET_PURPOSES)
    purpose: AiImageAdminAssetPurpose;

    @ApiPropertyOptional({
        description: '업로드할 이미지 MIME 타입 (jpg, png, webp 만 가능)',
        example: 'image/png',
        default: 'image/png',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    contentType?: string;
}
