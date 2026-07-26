import { Module } from '@nestjs/common';

import {
    AUTH_SESSION_MODULE_CONTROLLERS,
    AUTH_SESSION_MODULE_IMPORTS,
    AUTH_SESSION_MODULE_PROVIDERS,
} from './auth-session.module-definition';

/**
 * 인증 > 세션 슬라이스
 * - 액세스 토큰 재발급(refresh)
 * - 로그아웃 및 인증 쿠키 정리
 */
@Module({
    imports: AUTH_SESSION_MODULE_IMPORTS,
    controllers: AUTH_SESSION_MODULE_CONTROLLERS,
    providers: AUTH_SESSION_MODULE_PROVIDERS,
})
export class AuthSessionModule {}
