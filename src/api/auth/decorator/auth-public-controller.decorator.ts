import { applyDecorators, Controller } from '@nestjs/common';

import { ApiAuthController } from '../swagger';

export function AuthPublicController() {
    return applyDecorators(ApiAuthController(), Controller('v2/auth'));
}

/** OAuth 소셜 로그인 전용 — 콜백 URL이 제공사에 등록되어 있으므로 경로를 변경할 수 없다. */
export function AuthSocialOAuthController() {
    return applyDecorators(ApiAuthController(), Controller('auth'));
}
