import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_REPORT_ADMIN_READER } from '../ports/breeder-report-admin-reader.port';
import type { BreederReportAdminReaderPort } from '../ports/breeder-report-admin-reader.port';
import { BreederReportAdminPolicyService } from '../../domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminPresentationService } from '../../domain/services/breeder-report-admin-presentation.service';
import type { BreederReportListQuery } from '../types/breeder-report-admin-command.type';
import type { BreederReportAdminPageResult } from '../types/breeder-report-admin-result.type';

@Injectable()
export class GetBreederReportsUseCase {
    constructor(
        @Inject(BREEDER_REPORT_ADMIN_READER)
        private readonly breederReportAdminReader: BreederReportAdminReaderPort,
        private readonly breederReportAdminPolicyService: BreederReportAdminPolicyService,
        private readonly breederReportAdminPresentationService: BreederReportAdminPresentationService,
    ) {}

    async execute(adminId: string, filter: BreederReportListQuery): Promise<BreederReportAdminPageResult> {
        this.breederReportAdminPolicyService.assertCanManageBreeders(
            await this.breederReportAdminReader.findAdminById(adminId),
        );

        const pageNumber = filter.pageNumber ?? 1;
        const itemsPerPage = filter.itemsPerPage ?? 10;
        const result = await this.breederReportAdminReader.getReports({
            status: filter.status,
            pageNumber,
            itemsPerPage,
        });

        return this.breederReportAdminPresentationService.createReportListResponse(
            result,
            pageNumber,
            itemsPerPage,
        );
    }
}
