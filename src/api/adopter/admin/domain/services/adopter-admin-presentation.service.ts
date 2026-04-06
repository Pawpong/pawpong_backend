import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import {
    AdminApplicationDetailResponseDto,
    AdminCustomResponseDto,
    AdminStandardResponsesDto,
} from '../../dto/response/application-detail-response.dto';
import {
    AdminApplicationListItemDto,
    AdminApplicationListResponseDto,
} from '../../dto/response/application-list-response.dto';
import { ReviewReportItemDto } from '../../dto/response/review-report-list.dto';
import {
    AdopterAdminApplicationDetailSnapshot,
    AdopterAdminApplicationListSnapshot,
    AdopterAdminReviewReportPageSnapshot,
} from '../../application/ports/adopter-admin-reader.port';

@Injectable()
export class AdopterAdminPresentationService {
    toReviewReportsPage(
        snapshot: AdopterAdminReviewReportPageSnapshot,
    ): PaginationResponseDto<ReviewReportItemDto> {
        return new PaginationBuilder<ReviewReportItemDto>()
            .setItems(
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
            )
            .setPage(snapshot.page)
            .setLimit(snapshot.limit)
            .setTotalCount(snapshot.totalCount)
            .build();
    }

    toDeleteReviewResponse(): { message: string } {
        return {
            message: 'Review deleted successfully',
        };
    }

    toApplicationList(snapshot: AdopterAdminApplicationListSnapshot): AdminApplicationListResponseDto {
        return {
            applications: snapshot.items.map(
                (item): AdminApplicationListItemDto => ({
                    applicationId: item.applicationId,
                    adopterName: item.adopterName,
                    adopterEmail: item.adopterEmail,
                    adopterPhone: item.adopterPhone,
                    breederId: item.breederId,
                    breederName: item.breederName,
                    petName: item.petName,
                    status: item.status,
                    appliedAt: item.appliedAt,
                    processedAt: item.processedAt,
                }),
            ),
            totalCount: snapshot.totalCount,
            pendingCount: snapshot.pendingCount,
            completedCount: snapshot.completedCount,
            approvedCount: snapshot.approvedCount,
            rejectedCount: snapshot.rejectedCount,
            currentPage: snapshot.page,
            pageSize: snapshot.limit,
            totalPages: Math.ceil(snapshot.totalCount / snapshot.limit),
        };
    }

    toApplicationDetail(snapshot: AdopterAdminApplicationDetailSnapshot): AdminApplicationDetailResponseDto {
        return {
            applicationId: snapshot.applicationId,
            adopterName: snapshot.adopterName,
            adopterEmail: snapshot.adopterEmail,
            adopterPhone: snapshot.adopterPhone,
            breederId: snapshot.breederId,
            breederName: snapshot.breederName,
            petName: snapshot.petName,
            status: snapshot.status,
            standardResponses: snapshot.standardResponses as AdminStandardResponsesDto,
            customResponses: snapshot.customResponses as AdminCustomResponseDto[],
            appliedAt: snapshot.appliedAt,
            processedAt: snapshot.processedAt,
            breederNotes: snapshot.breederNotes,
        };
    }
}
