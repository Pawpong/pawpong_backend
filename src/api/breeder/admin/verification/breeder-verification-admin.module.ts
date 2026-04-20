import { Module } from '@nestjs/common';

import {
    BREEDER_VERIFICATION_ADMIN_MODULE_CONTROLLERS,
    BREEDER_VERIFICATION_ADMIN_MODULE_IMPORTS,
    BREEDER_VERIFICATION_ADMIN_MODULE_PROVIDERS,
} from './breeder-verification-admin.module-definition';

/**
 * 브리더 인증 관리자 모듈
 *
 * 관리자가 브리더 인증을 관리하는 기능을 제공합니다:
 * - 브리더 인증 승인/거절
 * - 브리더 목록 조회
 * - 승인 대기 브리더 목록 조회
 *
 * Note: NotificationDispatchPort는 NotificationModule, MailTemplateService는 MailModule을 통해 제공받습니다.
 */
@Module({
    imports: BREEDER_VERIFICATION_ADMIN_MODULE_IMPORTS,
    controllers: BREEDER_VERIFICATION_ADMIN_MODULE_CONTROLLERS,
    providers: BREEDER_VERIFICATION_ADMIN_MODULE_PROVIDERS,
})
export class BreederVerificationAdminModule {}
