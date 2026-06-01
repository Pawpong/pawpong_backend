import { Injectable } from '@nestjs/common';

import { CommunityReportRepository } from '../repository/community-report.repository';
import type { CommunityReportPort } from '../application/ports/community-report.port';
import type { CommunityReportAdminReaderPort } from '../admin/application/ports/community-report-admin-reader.port';
import type { CommunityReportAdminWriterPort } from '../admin/application/ports/community-report-admin-writer.port';
import type {
    CommunityReportAdminItem,
    CommunityReportAdminListResult,
    CommunityReportAdminUpdateData,
    CommunityReportCreateData,
    CommunityReportStatus,
} from '../application/types/community-report.type';

@Injectable()
export class CommunityReportMongooseAdapter
    implements CommunityReportPort, CommunityReportAdminReaderPort, CommunityReportAdminWriterPort
{
    constructor(private readonly reportRepo: CommunityReportRepository) {}

    report(data: CommunityReportCreateData): Promise<{ alreadyReported: boolean }> {
        return this.reportRepo.report(data);
    }

    findReports(query: {
        skip: number;
        limit: number;
        status?: CommunityReportStatus;
    }): Promise<CommunityReportAdminListResult> {
        return this.reportRepo.findReports(query);
    }

    findReportById(reportId: string): Promise<CommunityReportAdminItem | null> {
        return this.reportRepo.findReportById(reportId);
    }

    updateReportStatus(reportId: string, data: CommunityReportAdminUpdateData): Promise<void> {
        return this.reportRepo.updateReportStatus(reportId, data);
    }

    hidePost(postId: string): Promise<void> {
        return this.reportRepo.hidePost(postId);
    }
}
