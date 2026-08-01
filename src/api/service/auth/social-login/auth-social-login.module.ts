import { Module } from '@nestjs/common';

import {
    AUTH_SOCIAL_LOGIN_MODULE_CONTROLLERS,
    AUTH_SOCIAL_LOGIN_MODULE_IMPORTS,
    AUTH_SOCIAL_LOGIN_MODULE_PROVIDERS,
} from './auth-social-login.module-definition';

/**
 * 인증 > 소셜 로그인 슬라이스
 * - 구글/카카오/네이버 OAuth 진입 및 콜백 처리
 * - 기존 회원 로그인 / 신규 회원 가입 리다이렉트 분기
 * - 소셜 가입 완료(기존·레거시 흐름)
 */
@Module({
    imports: AUTH_SOCIAL_LOGIN_MODULE_IMPORTS,
    controllers: AUTH_SOCIAL_LOGIN_MODULE_CONTROLLERS,
    providers: AUTH_SOCIAL_LOGIN_MODULE_PROVIDERS,
})
export class AuthSocialLoginModule {}
