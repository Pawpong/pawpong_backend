import { Module } from '@nestjs/common';

import {
    AUTH_SHARED_MODULE_EXPORTS,
    AUTH_SHARED_MODULE_IMPORTS,
    AUTH_SHARED_MODULE_PROVIDERS,
} from './auth-shared.module-definition';

/**
 * 인증 공통 슬라이스
 * - 사용자 영속성, 토큰/회원가입/임시업로드 Port, 공용 도메인 서비스
 * - JWT 인증 인프라(JwtStrategy)를 등록하고 JwtModule/PassportModule 을 재노출
 */
@Module({
    imports: AUTH_SHARED_MODULE_IMPORTS,
    providers: AUTH_SHARED_MODULE_PROVIDERS,
    exports: AUTH_SHARED_MODULE_EXPORTS,
})
export class AuthSharedModule {}
