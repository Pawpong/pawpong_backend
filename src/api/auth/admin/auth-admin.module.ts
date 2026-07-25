import { Module } from '@nestjs/common';

import {
    AUTH_ADMIN_MODULE_CONTROLLERS,
    AUTH_ADMIN_MODULE_IMPORTS,
    AUTH_ADMIN_MODULE_PROVIDERS,
} from './auth-admin.module-definition';

/**
 * 인증 > 관리자 인증 슬라이스
 * - 관리자 로그인(비밀번호 검증)
 * - 관리자 토큰 재발급
 */
@Module({
    imports: AUTH_ADMIN_MODULE_IMPORTS,
    controllers: AUTH_ADMIN_MODULE_CONTROLLERS,
    providers: AUTH_ADMIN_MODULE_PROVIDERS,
})
export class AuthAdminModule {}
