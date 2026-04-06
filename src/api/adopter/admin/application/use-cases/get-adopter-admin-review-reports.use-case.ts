import { Inject, Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { ReviewReportItemDto } from '../../dto/response/review-report-list.dto';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminPresentationService } from '../../domain/services/adopter-admin-presentation.service';
import { ADOPTER_ADMIN_READER } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';

@Injectable()
export class GetAdopterAdminReviewReportsUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminPresentationService: AdopterAdminPresentationService,
    ) {}

    async execute(
        adminId: string,
        pageStr: string = '1',
        limitStr: string = '10',
    ): Promise<PaginationResponseDto<ReviewReportItemDto>> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanManageReports(admin);

        const page = parseInt(pageStr, 10) || 1;
        const limit = parseInt(limitStr, 10) || 10;
        const snapshot = await this.adopterAdminReader.findReportedReviews(page, limit);

        return this.adopterAdminPresentationService.toReviewReportsPage(snapshot);
    }
}
