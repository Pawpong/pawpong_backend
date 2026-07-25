import type {
    CommunityReportAdminItem,
    CommunityReportAdminListResult,
    CommunityReportStatus,
} from '../../../application/types/community-report.type';

export const COMMUNITY_REPORT_ADMIN_READER_PORT = Symbol('COMMUNITY_REPORT_ADMIN_READER_PORT');

export interface CommunityReportAdminReaderPort {
    findReports(query: {
        skip: number;
        limit: number;
        status?: CommunityReportStatus;
    }): Promise<CommunityReportAdminListResult>;
    findReportById(reportId: string): Promise<CommunityReportAdminItem | null>;
}
