import { Inject, Injectable } from '@nestjs/common';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { AdopterAdminActivityLogFactoryService } from '../../domain/services/adopter-admin-activity-log-factory.service';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReviewResponseService } from '../../domain/services/adopter-admin-review-response.service';
import { ADOPTER_ADMIN_READER } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { ADOPTER_ADMIN_WRITER } from '../ports/adopter-admin-writer.port';
import type { AdopterAdminWriterPort } from '../ports/adopter-admin-writer.port';

@Injectable()
export class DeleteAdopterAdminReviewUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        @Inject(ADOPTER_ADMIN_WRITER)
        private readonly adopterAdminWriter: AdopterAdminWriterPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminActivityLogFactoryService: AdopterAdminActivityLogFactoryService,
        private readonly adopterAdminReviewResponseService: AdopterAdminReviewResponseService,
    ) {}

    async execute(adminId: string, breederId: string, reviewId: string): Promise<any> {
        const admin = await this.adopterAdminReader.findAdminById(adminId);
        this.adopterAdminPolicyService.assertCanManageReports(admin);

        const deletedReview = await this.adopterAdminWriter.hideReview(breederId, reviewId);
        const review = this.adopterAdminPolicyService.assertReviewExists(deletedReview);

        const activityLog = this.adopterAdminActivityLogFactoryService.create(
            AdminAction.DELETE_REVIEW,
            AdminTargetType.REVIEW,
            reviewId,
            `Review for ${review.breederName || 'Unknown'}`,
            'Review deleted due to violation',
        );

        await this.adopterAdminWriter.appendAdminActivity(adminId, activityLog);

        return this.adopterAdminReviewResponseService.toDeleteReviewResponse();
    }
}
