import { Module } from '@nestjs/common';

import {
    AUTH_SIGNUP_MODULE_CONTROLLERS,
    AUTH_SIGNUP_MODULE_EXPORTS,
    AUTH_SIGNUP_MODULE_IMPORTS,
    AUTH_SIGNUP_MODULE_PROVIDERS,
} from './auth-signup.module-definition';

/**
 * 인증 > 회원가입 슬라이스
 * - 입양자/브리더 회원가입, 이메일·닉네임·브리더명 중복 검사
 * - v2 약관 동의 기반 입양자 가입
 * - 가입 유스케이스를 Port 토큰으로 소셜 가입 완료 흐름에 노출
 */
@Module({
    imports: AUTH_SIGNUP_MODULE_IMPORTS,
    controllers: AUTH_SIGNUP_MODULE_CONTROLLERS,
    providers: AUTH_SIGNUP_MODULE_PROVIDERS,
    exports: AUTH_SIGNUP_MODULE_EXPORTS,
})
export class AuthSignupModule {}
