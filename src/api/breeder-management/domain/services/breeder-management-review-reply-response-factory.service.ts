import { Injectable } from '@nestjs/common';

@Injectable()
export class BreederManagementReviewReplyResponseFactoryService {
    createAdded(reviewId: string, replyContent: string, replyWrittenAt: Date) {
        return {
            reviewId,
            replyContent,
            replyWrittenAt: replyWrittenAt.toISOString(),
        };
    }

    createUpdated(
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

    createDeleted(reviewId: string) {
        return {
            reviewId,
            message: '답글이 삭제되었습니다.',
        };
    }
}
