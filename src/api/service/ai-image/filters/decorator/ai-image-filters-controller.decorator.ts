import { Controller, applyDecorators } from '@nestjs/common';

import { ApiAiImagePublicController } from '../swagger/index';

/**
 * AI 필터 목록 — 공개 조회.
 * 로그인 전 필터를 미리 보여줄 수 있어야 하므로 가드를 걸지 않는다.
 */
export function AiImageFiltersController() {
    return applyDecorators(ApiAiImagePublicController(), Controller('v2/ai-image'));
}
