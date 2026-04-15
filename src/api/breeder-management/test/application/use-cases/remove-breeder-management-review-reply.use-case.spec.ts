import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';

import { RemoveBreederManagementReviewReplyUseCase } from '../../../application/use-cases/remove-breeder-management-review-reply.use-case';
import { BreederManagementReviewReplyResultMapperService } from '../../../domain/services/breeder-management-review-reply-result-mapper.service';

describe('브리더 후기 답글 삭제 유스케이스', () => {
    const breederManagementReviewReplyPort = {
        findReviewByIdAndBreeder: jest.fn(),
        deleteReply: jest.fn(),
    };

    const useCase = new RemoveBreederManagementReviewReplyUseCase(
        breederManagementReviewReplyPort as any,
        new BreederManagementReviewReplyResultMapperService(),
    );

    const mockReviewWithReply = { _id: 'review-1', breederId: 'breeder-1', replyContent: '기존 답글' };
    const mockReviewWithoutReply = { _id: 'review-1', breederId: 'breeder-1', replyContent: null };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기 답글을 삭제한다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReviewWithReply);
        breederManagementReviewReplyPort.deleteReply.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'review-1');

        expect(result.reviewId).toBe('review-1');
        expect(result.message).toBeDefined();
        expect(breederManagementReviewReplyPort.deleteReply).toHaveBeenCalledWith('review-1');
    });

    it('해당 후기를 찾을 수 없거나 권한이 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-review')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('breeder-1', 'nonexistent-review')).rejects.toThrow(
            '해당 후기를 찾을 수 없거나 권한이 없습니다.',
        );
        expect(breederManagementReviewReplyPort.deleteReply).not.toHaveBeenCalled();
    });

    it('삭제할 답글이 없으면 도메인 검증 예외를 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReviewWithoutReply);

        await expect(useCase.execute('breeder-1', 'review-1')).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('breeder-1', 'review-1')).rejects.toThrow('삭제할 답글이 없습니다.');
        expect(breederManagementReviewReplyPort.deleteReply).not.toHaveBeenCalled();
    });
});
