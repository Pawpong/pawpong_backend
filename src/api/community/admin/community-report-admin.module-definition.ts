import { CommunitySharedModule } from '../shared/community-shared.module';
import { CommunityInteractionsModule } from '../interactions/community-interactions.module';
import { CommunityReportAdminQueryController } from './controller/community-report-admin-query.controller';
import { CommunityReportAdminCommandController } from './controller/community-report-admin-command.controller';
import { GetCommunityPostReportsUseCase } from './application/use-cases/get-community-post-reports.use-case';
import { HandleCommunityPostReportUseCase } from './application/use-cases/handle-community-post-report.use-case';
import { CommunityReportMongooseAdapter } from '../infrastructure/community-report-mongoose.adapter';
import { COMMUNITY_REPORT_ADMIN_READER_PORT } from './application/ports/community-report-admin-reader.port';
import { COMMUNITY_REPORT_ADMIN_WRITER_PORT } from './application/ports/community-report-admin-writer.port';

// 커뮤니티 > 관리자 신고 처리 슬라이스
// 신고 어댑터는 사용자 신고(interactions)와 같은 인스턴스를 재사용한다.
export const COMMUNITY_REPORT_ADMIN_MODULE_IMPORTS = [CommunitySharedModule, CommunityInteractionsModule];

export const COMMUNITY_REPORT_ADMIN_MODULE_CONTROLLERS = [
    CommunityReportAdminQueryController,
    CommunityReportAdminCommandController,
];

export const COMMUNITY_REPORT_ADMIN_MODULE_PROVIDERS = [
    GetCommunityPostReportsUseCase,
    HandleCommunityPostReportUseCase,
    { provide: COMMUNITY_REPORT_ADMIN_READER_PORT, useExisting: CommunityReportMongooseAdapter },
    { provide: COMMUNITY_REPORT_ADMIN_WRITER_PORT, useExisting: CommunityReportMongooseAdapter },
];
