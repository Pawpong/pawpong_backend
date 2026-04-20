import { Module } from '@nestjs/common';

import {
    BREEDER_ADMIN_MODULE_CONTROLLERS,
    BREEDER_ADMIN_MODULE_EXPORTS,
    BREEDER_ADMIN_MODULE_IMPORTS,
    BREEDER_ADMIN_MODULE_PROVIDERS,
} from './breeder-admin.module-definition';

/**
 * 브리더 관리자 모듈 (통합)
 *
 * 관리자가 브리더를 관리하는 모든 기능을 통합 제공합니다:
 * - 브리더 계정 관리 (정지/해제/테스트 계정/리마인드)
 * - 브리더 인증 관리 - BreederVerificationAdminModule
 * - 브리더 신고 관리 - BreederReportAdminModule
 *
 * 구조:
 * - /api/breeder-admin/* - 계정 관리 (기본)
 * - /api/breeder-admin/verification/* - 인증 관리 (서브모듈)
 * - /api/breeder-admin/report/* - 신고 관리 (서브모듈)
 */
@Module({
    imports: BREEDER_ADMIN_MODULE_IMPORTS,
    controllers: BREEDER_ADMIN_MODULE_CONTROLLERS,
    providers: BREEDER_ADMIN_MODULE_PROVIDERS,
    exports: BREEDER_ADMIN_MODULE_EXPORTS,
})
export class BreederAdminModule {}
