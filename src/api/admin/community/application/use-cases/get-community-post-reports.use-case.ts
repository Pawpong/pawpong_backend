import { Inject, Injectable } from '@nestjs/common';

import { buildPageResult, type PageResult } from '../../../../../common/types/page-result.type';
import {
    COMMUNITY_REPORT_ADMIN_READER_PORT,
    type CommunityReportAdminReaderPort,
} from '../ports/community-report-admin-reader.port';
import type { CommunityReportAdminItem, CommunityReportStatus } from '../../../../service/community/application/types/community-report.type';

interface GetReportsQuery {
    page: number;
    pageSize: number;
    status?: CommunityReportStatus;
}

@Injectable()
export class GetCommunityPostReportsUseCase {
    constructor(
        @Inject(COMMUNITY_REPORT_ADMIN_READER_PORT)
        private readonly reportAdminReader: CommunityReportAdminReaderPort,
    ) {}

    async execute(query: GetReportsQuery): Promise<PageResult<CommunityReportAdminItem>> {
        const skip = (query.page - 1) * query.pageSize;
        const { items, totalItems } = await this.reportAdminReader.findReports({
            skip,
            limit: query.pageSize,
            status: query.status,
        });
        return buildPageResult(items, query.page, query.pageSize, totalItems);
    }
}
