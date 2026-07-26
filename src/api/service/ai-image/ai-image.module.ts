import { Module } from '@nestjs/common';

import { AI_IMAGE_MODULE_EXPORTS, AI_IMAGE_MODULE_IMPORTS } from './ai-image.module-definition';

/**
 * AI 이미지 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/admin, 이후 filters/generation) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: AI_IMAGE_MODULE_IMPORTS,
    exports: AI_IMAGE_MODULE_EXPORTS,
})
export class AiImageModule {}
