import { Inject, Injectable } from '@nestjs/common';

import { BREEDER_REPORT_ADMIN_READER_PORT } from '../ports/breeder-report-admin-reader.port';
import type { BreederReportAdminReaderPort } from '../ports/breeder-report-admin-reader.port';
import { BreederReportAdminPolicyService } from '../../domain/services/breeder-report-admin-policy.service';
import { BreederReportAdminPageAssemblerService } from '../../domain/services/breeder-report-admin-page-assembler.service';
import type { BreederReportListQuery } from '../types/breeder-report-admin-command.type';
import type { BreederReportAdminPageResult } from '../types/breeder-report-admin-result.type';

@Injectable()
export class GetBreederReportsUseCase {
    constructor(
        @Inject(BREEDER_REPORT_ADMIN_READER_PORT)
        private readonly breederReportAdminReader: BreederReportAdminReaderPort,
        private readonly breederReportAdminPolicyService: BreederReportAdminPolicyService,
        private readonly breederReportAdminPageAssemblerService: BreederReportAdminPageAssemblerService,
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

        return this.breederReportAdminPageAssemblerService.build(result, pageNumber, itemsPerPage);
    }
}
