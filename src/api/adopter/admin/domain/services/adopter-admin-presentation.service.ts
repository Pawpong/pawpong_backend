import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import {
    AdminApplicationDetailResponseDto,
    AdminCustomResponseDto,
    AdminStandardResponsesDto,
} from '../../dto/response/application-detail-response.dto';
import {
    AdminApplicationListResponseDto,
} from '../../dto/response/application-list-response.dto';
import { ReviewReportItemDto } from '../../dto/response/review-report-list.dto';
import {
    AdopterAdminApplicationDetailSnapshot,
    AdopterAdminApplicationListSnapshot,
    AdopterAdminReviewReportPageSnapshot,
} from '../../application/ports/adopter-admin-reader.port';
import { ADOPTER_ADMIN_RESPONSE_PAYLOADS } from '../../constants/adopter-admin-response-payloads';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';
import { AdopterAdminApplicationListAssemblerService } from './adopter-admin-application-list-assembler.service';

@Injectable()
export class AdopterAdminPresentationService {
    constructor(
        private readonly adopterPaginationAssemblerService: AdopterPaginationAssemblerService,
        private readonly adopterAdminApplicationListAssemblerService: AdopterAdminApplicationListAssemblerService,
    ) {}

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

    toDeleteReviewResponse(): { message: string } {
        return {
            message: ADOPTER_ADMIN_RESPONSE_PAYLOADS.reviewDeleted,
        };
    }

    toApplicationList(snapshot: AdopterAdminApplicationListSnapshot): AdminApplicationListResponseDto {
        return this.adopterAdminApplicationListAssemblerService.toResponse(snapshot);
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
