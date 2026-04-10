import { Injectable } from '@nestjs/common';

import { AdopterAdminReviewReportPageSnapshot } from '../../application/ports/adopter-admin-reader.port';
import { buildPageResult } from '../../../../../common/types/page-result.type';
import type { AdopterAdminReviewReportPageResult } from '../../application/types/adopter-admin-result.type';

@Injectable()
export class AdopterAdminReviewReportPresentationService {
    toReviewReportsPage(
        snapshot: AdopterAdminReviewReportPageSnapshot,
    ): AdopterAdminReviewReportPageResult {
        return buildPageResult(
            snapshot.items.map((item) => ({
                reviewId: item.reviewId,
                breederId: item.breederId,
                breederName: item.breederName,
                authorId: item.authorId,
                authorName: item.authorName,
                reportedBy: item.reportedBy as string,
                reporterName: item.reporterName,
                reportReason: item.reportReason as string,
                reportDescription: item.reportDescription as string,
                reportedAt: item.reportedAt as Date,
                content: item.content,
                writtenAt: item.writtenAt,
                isVisible: item.isVisible,
            })),
            snapshot.page,
            snapshot.limit,
            snapshot.totalCount,
        );
    }
}
