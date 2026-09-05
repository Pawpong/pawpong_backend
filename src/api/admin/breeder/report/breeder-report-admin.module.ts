import { Module } from '@nestjs/common';

import {
    BREEDER_REPORT_ADMIN_MODULE_CONTROLLERS,
    BREEDER_REPORT_ADMIN_MODULE_IMPORTS,
    BREEDER_REPORT_ADMIN_MODULE_PROVIDERS,
} from './breeder-report-admin.module-definition';

/**
 * 브리더 신고 관리 Admin 모듈
 *
 * 관리자가 브리더 신고를 관리하는 기능을 제공합니다:
 * - 브리더 신고 목록 조회
 * - 브리더 신고 처리 (승인/반려)
 */
@Module({
    imports: BREEDER_REPORT_ADMIN_MODULE_IMPORTS,
    controllers: BREEDER_REPORT_ADMIN_MODULE_CONTROLLERS,
    providers: BREEDER_REPORT_ADMIN_MODULE_PROVIDERS,
})
export class BreederReportAdminModule {}
