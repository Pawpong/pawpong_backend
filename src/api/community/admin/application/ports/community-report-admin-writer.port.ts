import type { CommunityReportAdminUpdateData } from '../../../application/types/community-report.type';

export const COMMUNITY_REPORT_ADMIN_WRITER_PORT = Symbol('COMMUNITY_REPORT_ADMIN_WRITER_PORT');

export interface CommunityReportAdminWriterPort {
    /** 신고 상태를 갱신한다. */
    updateReportStatus(reportId: string, data: CommunityReportAdminUpdateData): Promise<void>;
    /** 게시글을 숨김 처리(isActive=false)한다. */
    hidePost(postId: string): Promise<void>;
}
