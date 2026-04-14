import { BadRequestException } from '@nestjs/common';

import { UpdateBreederManagementReviewReplyUseCase } from '../../../application/use-cases/update-breeder-management-review-reply.use-case';
import { BreederManagementReviewReplyResultMapperService } from '../../../domain/services/breeder-management-review-reply-result-mapper.service';

describe('브리더 후기 답글 수정 유스케이스', () => {
    const breederManagementReviewReplyPort = {
        findReviewByIdAndBreeder: jest.fn(),
        updateReply: jest.fn(),
    };

    const useCase = new UpdateBreederManagementReviewReplyUseCase(
        breederManagementReviewReplyPort as any,
        new BreederManagementReviewReplyResultMapperService(),
    );

    const mockReviewWithReply = {
        _id: 'review-1',
        breederId: 'breeder-1',
        replyContent: '기존 답글',
        replyWrittenAt: new Date('2026-01-01'),
    };
    const mockReviewWithoutReply = { _id: 'review-1', breederId: 'breeder-1', replyContent: null };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기 답글을 수정한다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReviewWithReply);
        breederManagementReviewReplyPort.updateReply.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'review-1', '수정된 답글');

        expect(result.reviewId).toBe('review-1');
        expect(result.replyContent).toBe('수정된 답글');
        expect(result.replyUpdatedAt).toBeDefined();
        expect(breederManagementReviewReplyPort.updateReply).toHaveBeenCalledWith(
            'review-1',
            expect.objectContaining({ replyContent: '수정된 답글' }),
        );
    });

    it('해당 후기를 찾을 수 없거나 권한이 없으면 BadRequestException을 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-review', '수정 답글')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'nonexistent-review', '수정 답글')).rejects.toThrow(
            '해당 후기를 찾을 수 없거나 권한이 없습니다.',
        );
        expect(breederManagementReviewReplyPort.updateReply).not.toHaveBeenCalled();
    });

    it('수정할 답글이 없으면 BadRequestException을 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReviewWithoutReply);

        await expect(useCase.execute('breeder-1', 'review-1', '수정 답글')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'review-1', '수정 답글')).rejects.toThrow(
            '수정할 답글이 없습니다. 먼저 답글을 작성해주세요.',
        );
        expect(breederManagementReviewReplyPort.updateReply).not.toHaveBeenCalled();
    });
});
