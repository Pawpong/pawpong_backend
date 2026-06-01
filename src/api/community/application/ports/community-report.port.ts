import type { CommunityReportCreateData } from '../types/community-report.type';

export const COMMUNITY_REPORT_PORT = Symbol('COMMUNITY_REPORT_PORT');

export interface CommunityReportPort {
    /** 신고 저장. 이미 신고한 경우 alreadyReported=true 반환 (upsert 없음, 멱등). */
    report(data: CommunityReportCreateData): Promise<{ alreadyReported: boolean }>;
}
