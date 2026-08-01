import { Module } from '@nestjs/common';

import { AUTH_BANNER_MODULE_CONTROLLERS, AUTH_BANNER_MODULE_IMPORTS } from './auth-banner.module-definition';

/**
 * 인증 > 배너 슬라이스
 * - 로그인/회원가입 화면에 노출되는 활성 프로필 배너 조회
 */
@Module({
    imports: AUTH_BANNER_MODULE_IMPORTS,
    controllers: AUTH_BANNER_MODULE_CONTROLLERS,
})
export class AuthBannerModule {}
