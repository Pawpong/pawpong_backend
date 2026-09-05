import { BreederManagementReviewReplyResultMapperService } from '../../../domain/services/breeder-management-review-reply-result-mapper.service';
import { BREEDER_MANAGEMENT_RESPONSE_MESSAGES } from '../../../constants/breeder-management-response-messages';

describe('브리더 관리 후기 답글 결과 매퍼', () => {
    const service = new BreederManagementReviewReplyResultMapperService();

    it('후기 답글 결과를 일관된 형태로 만든다', () => {
        const replyWrittenAt = new Date('2026-04-08T10:00:00.000Z');
        const replyUpdatedAt = new Date('2026-04-08T10:05:00.000Z');

        expect(service.toReviewReplyAddedResult('review-id', '답글 내용', replyWrittenAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '답글 내용',
            replyWrittenAt: replyWrittenAt.toISOString(),
        });

        expect(service.toReviewReplyUpdatedResult('review-id', '수정된 답글', replyWrittenAt, replyUpdatedAt)).toEqual({
            reviewId: 'review-id',
            replyContent: '수정된 답글',
            replyWrittenAt: replyWrittenAt.toISOString(),
            replyUpdatedAt: replyUpdatedAt.toISOString(),
        });

        expect(service.toReviewReplyDeletedResult('review-id')).toEqual({
            reviewId: 'review-id',
            message: BREEDER_MANAGEMENT_RESPONSE_MESSAGES.reviewReplyDeleted,
        });
    });
});
