import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../../common/dto/pagination/pagination-builder.dto';
import { ReportActionResponseDto } from '../../dto/response/report-action-response.dto';
import { ReportListResponseDto } from '../../dto/response/report-list-response.dto';
import {
    BreederReportAdminReportListItemSnapshot,
    BreederReportAdminReportListResult,
} from '../../application/ports/breeder-report-admin-reader.port';

@Injectable()
export class BreederReportAdminPresentationService {
    createReportListResponse(
        result: BreederReportAdminReportListResult,
        pageNumber: number,
        itemsPerPage: number,
    ): any {
        return new PaginationBuilder<ReportListResponseDto>()
            .setItems(result.items.map((item) => this.toReportListItem(item)))
            .setPage(pageNumber)
            .setLimit(itemsPerPage)
            .setTotalCount(result.totalCount)
            .build();
    }

    createReportActionResponse(
        reportId: string,
        breederId: string,
        action: string,
        status: string,
        adminNotes: string | undefined,
        processedAt: Date,
    ): ReportActionResponseDto {
        return {
            reportId,
            breederId,
            action,
            status,
            adminNotes,
            processedAt,
        };
    }

    private toReportListItem(item: BreederReportAdminReportListItemSnapshot): ReportListResponseDto {
        return {
            reportId: item.reportId,
            targetId: item.targetId,
            targetName: item.targetName,
            type: item.type,
            description: item.description,
            status: item.status,
            reportedAt: item.reportedAt,
            adminNotes: item.adminNotes,
        };
    }
}
