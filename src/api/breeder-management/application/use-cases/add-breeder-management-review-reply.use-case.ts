import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from '../ports/breeder-management-review-reply.port';
import type { BreederManagementReviewReplyPort } from '../ports/breeder-management-review-reply.port';
import { BreederManagementReviewReplyResultMapperService } from '../../domain/services/breeder-management-review-reply-result-mapper.service';

@Injectable()
export class AddBreederManagementReviewReplyUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_REVIEW_REPLY_PORT)
        private readonly breederManagementReviewReplyPort: BreederManagementReviewReplyPort,
        private readonly breederManagementReviewReplyResultMapperService: BreederManagementReviewReplyResultMapperService,
    ) {}

    async execute(
        breederId: string,
        reviewId: string,
        content: string,
    ): Promise<{ reviewId: string; replyContent: string; replyWrittenAt: string }> {
        const review = await this.breederManagementReviewReplyPort.findReviewByIdAndBreeder(reviewId, breederId);
        if (!review) {
            throw new BadRequestException('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        if (review.replyContent) {
            throw new BadRequestException('이미 답글이 작성되어 있습니다. 수정 기능을 이용해주세요.');
        }

        const now = new Date();
        await this.breederManagementReviewReplyPort.addReply(reviewId, {
            replyContent: content,
            replyWrittenAt: now,
        });

        return this.breederManagementReviewReplyResultMapperService.toReviewReplyAddedResult(reviewId, content, now);
    }
}
