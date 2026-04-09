import { BreederManagementReviewReplyResponseService } from '../domain/services/breeder-management-review-reply-response.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../domain/services/breeder-management-response-message.service';

describe('브리더 관리 후기 답글 응답 서비스', () => {
    const service = new BreederManagementReviewReplyResponseService();

    it('후기 답글 응답을 일관된 형태로 만든다', () => {
        const replyWrittenAt = new Date('2026-04-08T10:00:00.000Z');
        const replyUpdatedAt = new Date('2026-04-08T10:05:00.000Z');

        expect(service.createReviewReplyAdded('review-id', '답글 내용', replyWrittenAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '답글 내용',
            replyWrittenAt: replyWrittenAt.toISOString(),
        });

        expect(service.createReviewReplyUpdated('review-id', '수정된 답글', replyWrittenAt, replyUpdatedAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '수정된 답글',
            replyWrittenAt: replyWrittenAt.toISOString(),
            replyUpdatedAt: replyUpdatedAt.toISOString(),
        });

        expect(service.createReviewReplyDeleted('review-id')).toEqual({
            reviewId: 'review-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        });
    });
});
