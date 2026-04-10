import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementReviewReplyResponseService {
    createReviewReplyAdded(reviewId: string, replyContent: string, replyWrittenAt: Date) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt.toISOString(),
        };
    }

    createReviewReplyUpdated(
        reviewId: string,
        replyContent: string,
        replyWrittenAt?: Date | null,
        replyUpdatedAt?: Date | null,
    ) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt?.toISOString(),
            replyUpdatedAt: replyUpdatedAt?.toISOString(),
        };
    }

    createReviewReplyDeleted(reviewId: string) {
        return {
            reviewId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        };
    }
}
