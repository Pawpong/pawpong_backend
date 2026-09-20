import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_KIND,
    OPS_PENDING_RESOLVED_EVENT,
    type OpsPendingResolvedEvent,
} from '../../../../../common/events/ops-pending.event';

import {
    COMMUNITY_REPORT_ADMIN_READER_PORT,
    type CommunityReportAdminReaderPort,
} from '../ports/community-report-admin-reader.port';
import {
    COMMUNITY_REPORT_ADMIN_WRITER_PORT,
    type CommunityReportAdminWriterPort,
} from '../ports/community-report-admin-writer.port';

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
        private readonly eventEmitter: EventEmitter2,
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

        // 처리된 건은 리마인드를 멈춘다. 처리했는데 독촉이 계속 오면 알림을 무시하게 된다.
        const opsResolved: OpsPendingResolvedEvent = {
            kind: OPS_PENDING_KIND.COMMUNITY_REPORT,
            referenceId: report.postId,
            resolution: action,
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_RESOLVED_EVENT, opsResolved);

        return { reportId, postId: report.postId, action };
    }
}
