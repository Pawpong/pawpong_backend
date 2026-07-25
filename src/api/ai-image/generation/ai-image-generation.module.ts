import { Module } from '@nestjs/common';

import {
    AI_IMAGE_GENERATION_MODULE_CONTROLLERS,
    AI_IMAGE_GENERATION_MODULE_IMPORTS,
    AI_IMAGE_GENERATION_MODULE_PROVIDERS,
} from './ai-image-generation.module-definition';

/**
 * AI 이미지 > 생성 슬라이스
 * - 원본 사진 업로드용 presigned URL 발급
 */
@Module({
    imports: AI_IMAGE_GENERATION_MODULE_IMPORTS,
    controllers: AI_IMAGE_GENERATION_MODULE_CONTROLLERS,
    providers: AI_IMAGE_GENERATION_MODULE_PROVIDERS,
})
export class AiImageGenerationModule {}
