import { Injectable } from '@nestjs/common';

import { BreederPaginationAssemblerService } from '../../../../domain/services/breeder-pagination-assembler.service';
import {
    BreederReportAdminReportListItemSnapshot,
    BreederReportAdminReportListResult,
} from '../../application/ports/breeder-report-admin-reader.port';
import type {
    BreederReportAdminActionResult,
    BreederReportAdminListItemResult,
    BreederReportAdminPageResult,
} from '../../application/types/breeder-report-admin-result.type';

@Injectable()
export class BreederReportAdminPresentationService {
    constructor(private readonly breederPaginationAssemblerService: BreederPaginationAssemblerService) {}

    createReportListResponse(
        result: BreederReportAdminReportListResult,
        pageNumber: number,
        itemsPerPage: number,
    ): BreederReportAdminPageResult {
        return this.breederPaginationAssemblerService.build(
            result.items.map((item) => this.toReportListItem(item)),
            pageNumber,
            itemsPerPage,
            result.totalCount,
        );
    }

    createReportActionResponse(
        reportId: string,
        breederId: string,
        action: string,
        status: string,
        adminNotes: string | undefined,
        processedAt: Date,
    ): BreederReportAdminActionResult {
        return {
            reportId,
            breederId,
            action,
            status,
            adminNotes,
            processedAt,
        };
    }

    private toReportListItem(item: BreederReportAdminReportListItemSnapshot): BreederReportAdminListItemResult {
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
