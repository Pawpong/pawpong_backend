import { Module } from '@nestjs/common';

import {
    COMMUNITY_REPORT_ADMIN_MODULE_CONTROLLERS,
    COMMUNITY_REPORT_ADMIN_MODULE_IMPORTS,
    COMMUNITY_REPORT_ADMIN_MODULE_PROVIDERS,
} from './community-report-admin.module-definition';

/**
 * 커뮤니티 > 관리자 신고 처리 슬라이스
 * - 신고 목록 조회
 * - 신고 처리(숨김/반려 등)
 */
@Module({
    imports: COMMUNITY_REPORT_ADMIN_MODULE_IMPORTS,
    controllers: COMMUNITY_REPORT_ADMIN_MODULE_CONTROLLERS,
    providers: COMMUNITY_REPORT_ADMIN_MODULE_PROVIDERS,
})
export class CommunityReportAdminModule {}
