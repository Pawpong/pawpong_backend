import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import {
    AI_IMAGE_ADMIN_ASSET_PURPOSES,
    type AiImageAdminAssetPurpose,
} from '../../../../service/ai-image/shared/domain/services/ai-image-object-key.service';

/** 어드민 애셋 서버 경유 업로드 (multipart) */
export class AiImageAdminAssetUploadRequestDto {
    @ApiProperty({
        description: '업로드 용도 (thumbnail: 필터 썸네일, reference: 스타일 레퍼런스, source: 미리보기 원본)',
        enum: AI_IMAGE_ADMIN_ASSET_PURPOSES,
        example: 'reference',
    })
    @IsIn(AI_IMAGE_ADMIN_ASSET_PURPOSES)
    purpose: AiImageAdminAssetPurpose;
}
