import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_REVIEW_REPLY_PORT } from '../ports/breeder-management-review-reply.port';
import type { BreederManagementReviewReplyPort } from '../ports/breeder-management-review-reply.port';
import { BreederManagementReviewReplyResponseFactoryService } from '../../domain/services/breeder-management-review-reply-response-factory.service';

@Injectable()
export class UpdateBreederManagementReviewReplyUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_REVIEW_REPLY_PORT)
        private readonly breederManagementReviewReplyPort: BreederManagementReviewReplyPort,
        private readonly breederManagementReviewReplyResponseFactoryService: BreederManagementReviewReplyResponseFactoryService,
    ) {}

    async execute(
        breederId: string,
        reviewId: string,
        content: string,
    ): Promise<{ reviewId: string; replyContent: string; replyWrittenAt?: string; replyUpdatedAt?: string }> {
        const review = await this.breederManagementReviewReplyPort.findReviewByIdAndBreeder(reviewId, breederId);
        if (!review) {
            throw new BadRequestException('해당 후기를 찾을 수 없거나 권한이 없습니다.');
        }

        if (!review.replyContent) {
            throw new BadRequestException('수정할 답글이 없습니다. 먼저 답글을 작성해주세요.');
        }

        const now = new Date();
        await this.breederManagementReviewReplyPort.updateReply(reviewId, {
            replyContent: content,
            replyUpdatedAt: now,
        });

        return this.breederManagementReviewReplyResponseFactoryService.createUpdated(
            reviewId,
            content,
            review.replyWrittenAt,
            now,
        );
    }
}
