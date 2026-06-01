import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { COMMUNITY_REPORT_ADMIN_READER_PORT, type CommunityReportAdminReaderPort } from '../ports/community-report-admin-reader.port';
import { COMMUNITY_REPORT_ADMIN_WRITER_PORT, type CommunityReportAdminWriterPort } from '../ports/community-report-admin-writer.port';

type ReportAction = 'resolve' | 'dismiss';

interface HandleReportResult {
    reportId: string;
    postId: string;
    action: ReportAction;
}

@Injectable()
export class HandleCommunityPostReportUseCase {
    constructor(
        @Inject(COMMUNITY_REPORT_ADMIN_READER_PORT)
        private readonly reportAdminReader: CommunityReportAdminReaderPort,
        @Inject(COMMUNITY_REPORT_ADMIN_WRITER_PORT)
        private readonly reportAdminWriter: CommunityReportAdminWriterPort,
    ) {}

    async execute(reportId: string, adminId: string, action: ReportAction): Promise<HandleReportResult> {
        const report = await this.reportAdminReader.findReportById(reportId);
        if (!report) throw new BadRequestException('해당 신고를 찾을 수 없습니다.');
        if (report.status !== 'pending') throw new BadRequestException('이미 처리된 신고입니다.');

        const resolvedAt = new Date();

        if (action === 'resolve') {
            await this.reportAdminWriter.hidePost(report.postId);
        }

        await this.reportAdminWriter.updateReportStatus(reportId, {
            status: action === 'resolve' ? 'resolved' : 'dismissed',
            resolvedByAdminId: adminId,
            resolvedAt,
        });

        return { reportId, postId: report.postId, action };
    }
}
