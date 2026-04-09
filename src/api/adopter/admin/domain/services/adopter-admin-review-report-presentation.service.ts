import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { ReviewReportItemDto } from '../../dto/response/review-report-list.dto';
import { AdopterAdminReviewReportPageSnapshot } from '../../application/ports/adopter-admin-reader.port';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';

@Injectable()
export class AdopterAdminReviewReportPresentationService {
    constructor(private readonly adopterPaginationAssemblerService: AdopterPaginationAssemblerService) {}

    toReviewReportsPage(
        snapshot: AdopterAdminReviewReportPageSnapshot,
    ): PaginationResponseDto<ReviewReportItemDto> {
        return this.adopterPaginationAssemblerService.build(
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
