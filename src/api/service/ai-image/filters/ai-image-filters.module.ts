import { Module } from '@nestjs/common';

import {
    AI_IMAGE_FILTERS_MODULE_CONTROLLERS,
    AI_IMAGE_FILTERS_MODULE_IMPORTS,
    AI_IMAGE_FILTERS_MODULE_PROVIDERS,
} from './ai-image-filters.module-definition';

/**
 * AI 이미지 > 사용자 필터 목록 슬라이스
 * - 활성 필터 카드 조회 (프롬프트 등 운영 정보 미노출)
 */
@Module({
    imports: AI_IMAGE_FILTERS_MODULE_IMPORTS,
    controllers: AI_IMAGE_FILTERS_MODULE_CONTROLLERS,
    providers: AI_IMAGE_FILTERS_MODULE_PROVIDERS,
})
export class AiImageFiltersModule {}
