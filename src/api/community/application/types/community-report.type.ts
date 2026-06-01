import type { CommunityAuthorModel } from './community-post.type';
import type { CommunityReportReason, CommunityReportStatus } from '../../../../schema/community-post-report.schema';

export type { CommunityReportReason, CommunityReportStatus };

export interface CommunityReportCreateData {
    postId: string;
    reporterId: string;
    reporterModel: CommunityAuthorModel;
    reporterNickname: string;
    reason: CommunityReportReason;
    description?: string;
}

export interface CommunityReportAdminItem {
    reportId: string;
    postId: string;
    reporterId: string;
    reporterNickname: string;
    reason: CommunityReportReason;
    description?: string;
    status: CommunityReportStatus;
    createdAt: string;
}

export interface CommunityReportAdminListResult {
    items: CommunityReportAdminItem[];
    totalItems: number;
}

export interface CommunityReportAdminUpdateData {
    status: CommunityReportStatus;
    resolvedByAdminId: string;
    resolvedAt: Date;
}
