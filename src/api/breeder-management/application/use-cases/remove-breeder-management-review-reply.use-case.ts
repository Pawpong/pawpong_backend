import { Inject, Injectable } from '@nestjs/common';
import { DomainNotFoundError, DomainValidationError } from '../../../../common/error/domain.error';

import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from '../ports/breeder-management-review-reply.port';
import type { BreederManagementReviewReplyPort } from '../ports/breeder-management-review-reply.port';
import { BreederManagementReviewReplyResultMapperService } from '../../domain/services/breeder-management-review-reply-result-mapper.service';

@Injectable()
export class RemoveBreederManagementReviewReplyUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_REVIEW_REPLY_PORT)
        private readonly breederManagementReviewReplyPort: BreederManagementReviewReplyPort,
        private readonly breederManagementReviewReplyResultMapperService: BreederManagementReviewReplyResultMapperService,
    ) {}

    async execute(breederId: string, reviewId: string): Promise<{ reviewId: string; message: string }> {
        const review = await this.breederManagementReviewReplyPort.findReviewByIdAndBreeder(reviewId, breederId);
        if (!review) {
            throw new DomainNotFoundError('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        if (!review.replyContent) {
            throw new DomainValidationError('삭제할 답글이 없습니다.');
        }

        await this.breederManagementReviewReplyPort.deleteReply(reviewId);

        return this.breederManagementReviewReplyResultMapperService.toReviewReplyDeletedResult(reviewId);
    }
}
