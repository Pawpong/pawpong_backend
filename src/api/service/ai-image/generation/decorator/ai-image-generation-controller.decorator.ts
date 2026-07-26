import { Controller, UseGuards, applyDecorators } from '@nestjs/common';

import { JwtAuthGuard } from '../../../../../common/guard/jwt-auth.guard';
import { ApiAiImageProtectedController } from '../swagger/index';

/** AI 이미지 생성 — 인증 필수 (입양자·브리더 모두 사용 가능) */
export function AiImageGenerationController() {
    return applyDecorators(ApiAiImageProtectedController(), Controller('v2/ai-image'), UseGuards(JwtAuthGuard));
}
