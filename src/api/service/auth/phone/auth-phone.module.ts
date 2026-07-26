import { Module } from '@nestjs/common';

import {
    AUTH_PHONE_MODULE_CONTROLLERS,
    AUTH_PHONE_MODULE_IMPORTS,
    AUTH_PHONE_MODULE_PROVIDERS,
} from './auth-phone.module-definition';

/**
 * 인증 > 휴대폰 인증 슬라이스
 * - 인증번호 발송(알림톡) 및 검증
 * - 테스트 번호 화이트리스트 처리
 */
@Module({
    imports: AUTH_PHONE_MODULE_IMPORTS,
    controllers: AUTH_PHONE_MODULE_CONTROLLERS,
    providers: AUTH_PHONE_MODULE_PROVIDERS,
})
export class AuthPhoneModule {}
