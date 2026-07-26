import { Module } from '@nestjs/common';

import {
    AI_IMAGE_SHARED_MODULE_EXPORTS,
    AI_IMAGE_SHARED_MODULE_IMPORTS,
    AI_IMAGE_SHARED_MODULE_PROVIDERS,
} from './ai-image-shared.module-definition';

/**
 * AI 이미지 공통 슬라이스
 * - 필터 조회 Port, 파일키 → CDN URL 변환 Port
 * - 필터/생성 작업 스키마 등록 및 재노출
 */
@Module({
    imports: AI_IMAGE_SHARED_MODULE_IMPORTS,
    providers: AI_IMAGE_SHARED_MODULE_PROVIDERS,
    exports: AI_IMAGE_SHARED_MODULE_EXPORTS,
})
export class AiImageSharedModule {}
