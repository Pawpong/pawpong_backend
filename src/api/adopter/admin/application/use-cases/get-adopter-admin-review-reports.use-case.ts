import { Inject, Injectable } from '@nestjs/common';

import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReviewReportPageAssemblerService } from '../../domain/services/adopter-admin-review-report-page-assembler.service';
import { ADOPTER_ADMIN_READER_PORT } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReviewReportPageResult } from '../types/adopter-admin-result.type';

@Injectable()
export class GetAdopterAdminReviewReportsUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER_PORT)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminReviewReportPageAssemblerService: AdopterAdminReviewReportPageAssemblerService,
    ) {}

    async execute(
        adminId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<AdopterAdminReviewReportPageResult> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanManageReports(admin);

        const snapshot = await this.adopterAdminReader.findReportedReviews(page, limit);

        return this.adopterAdminReviewReportPageAssemblerService.build(snapshot);
    }
}
