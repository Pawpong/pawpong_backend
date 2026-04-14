import { Injectable } from '@nestjs/common';

import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../constants/breeder-management-response-messages';

@Injectable()
export class BreederManagementReviewReplyResultMapperService {
    toReviewReplyAddedResult(reviewId: string, replyContent: string, replyWrittenAt: Date) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt.toISOString(),
        };
    }

    toReviewReplyUpdatedResult(
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

    toReviewReplyDeletedResult(reviewId: string) {
        return {
            reviewId,
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        };
    }
}
