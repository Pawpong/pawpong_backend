import { Module } from '@nestjs/common';

import {
    AI_IMAGE_ADMIN_MODULE_CONTROLLERS,
    AI_IMAGE_ADMIN_MODULE_IMPORTS,
    AI_IMAGE_ADMIN_MODULE_PROVIDERS,
} from './ai-image-admin.module-definition';

/**
 * AI 이미지 > 관리자 슬라이스
 * - AI 필터 CRUD (프롬프트·모델 관리)
 */
@Module({
    imports: AI_IMAGE_ADMIN_MODULE_IMPORTS,
    controllers: AI_IMAGE_ADMIN_MODULE_CONTROLLERS,
    providers: AI_IMAGE_ADMIN_MODULE_PROVIDERS,
})
export class AiImageAdminModule {}
