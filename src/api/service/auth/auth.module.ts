import { Module } from '@nestjs/common';
import { AUTH_MODULE_EXPORTS, AUTH_MODULE_IMPORTS } from './auth.module-definition';

/**
 * 인증 바운디드 컨텍스트
 * - 하위 기능 슬라이스(shared/signup/social-login/session/phone/upload/banner/admin) 조립만 담당
 * - 컨트롤러·프로바이더는 각 슬라이스 모듈이 소유한다
 */
@Module({
    imports: AUTH_MODULE_IMPORTS,
    exports: AUTH_MODULE_EXPORTS,
})
export class AuthModule {}
