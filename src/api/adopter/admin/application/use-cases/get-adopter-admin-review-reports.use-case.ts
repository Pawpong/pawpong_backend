import { Inject, Injectable } from '@nestjs/common';

import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReviewReportPresentationService } from '../../domain/services/adopter-admin-review-report-presentation.service';
import { ADOPTER_ADMIN_READER } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReviewReportPageResult } from '../types/adopter-admin-result.type';

@Injectable()
export class GetAdopterAdminReviewReportsUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminReviewReportPresentationService: AdopterAdminReviewReportPresentationService,
    ) {}

    async execute(
        adminId: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<AdopterAdminReviewReportPageResult> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanManageReports(admin);

        const snapshot = await this.adopterAdminReader.findReportedReviews(page, limit);

        return this.adopterAdminReviewReportPresentationService.toReviewReportsPage(snapshot);
    }
}
