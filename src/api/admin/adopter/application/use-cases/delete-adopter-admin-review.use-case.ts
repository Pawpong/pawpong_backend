import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
    OPS_PENDING_KIND,
    OPS_PENDING_RESOLVED_EVENT,
    type OpsPendingResolvedEvent,
} from '../../../../../common/events/ops-pending.event';

import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import { AdopterAdminActivityLogFactoryService } from '../../domain/services/adopter-admin-activity-log-factory.service';
import { AdopterAdminPolicyService } from '../../domain/services/adopter-admin-policy.service';
import { AdopterAdminReviewDeleteResultMapperService } from '../../domain/services/adopter-admin-review-delete-result-mapper.service';
import { ADOPTER_ADMIN_READER_PORT } from '../ports/adopter-admin-reader.port';
import type { AdopterAdminReaderPort } from '../ports/adopter-admin-reader.port';
import { ADOPTER_ADMIN_WRITER_PORT } from '../ports/adopter-admin-writer.port';
import type { AdopterAdminWriterPort } from '../ports/adopter-admin-writer.port';
import type { AdopterAdminReviewDeleteResult } from '../types/adopter-admin-result.type';

@Injectable()
export class DeleteAdopterAdminReviewUseCase {
    constructor(
        @Inject(ADOPTER_ADMIN_READER_PORT)
        private readonly adopterAdminReader: AdopterAdminReaderPort,
        @Inject(ADOPTER_ADMIN_WRITER_PORT)
        private readonly adopterAdminWriter: AdopterAdminWriterPort,
        private readonly adopterAdminPolicyService: AdopterAdminPolicyService,
        private readonly adopterAdminActivityLogFactoryService: AdopterAdminActivityLogFactoryService,
        private readonly adopterAdminReviewDeleteResultMapperService: AdopterAdminReviewDeleteResultMapperService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async execute(adminId: string, breederId: string, reviewId: string): Promise<AdopterAdminReviewDeleteResult> {
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

        // 처리된 건은 리마인드를 멈춘다. 처리했는데 독촉이 계속 오면 알림을 무시하게 된다.
        const opsResolved: OpsPendingResolvedEvent = {
            kind: OPS_PENDING_KIND.REVIEW_REPORT,
            referenceId: reviewId,
            resolution: '후기 숨김',
        };
        await this.eventEmitter.emitAsync(OPS_PENDING_RESOLVED_EVENT, opsResolved);

        return this.adopterAdminReviewDeleteResultMapperService.toDeleteReviewResult(
            reviewId,
            breederId,
            review.breederName || 'Unknown',
        );
    }
}
