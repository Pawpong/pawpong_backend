import { BadRequestException } from '@nestjs/common';

import { AddBreederManagementReviewReplyUseCase } from '../../../application/use-cases/add-breeder-management-review-reply.use-case';
import { BreederManagementReviewReplyResultMapperService } from '../../../domain/services/breeder-management-review-reply-result-mapper.service';

describe('브리더 후기 답글 등록 유스케이스', () => {
    const breederManagementReviewReplyPort = {
        findReviewByIdAndBreeder: jest.fn(),
        addReply: jest.fn(),
    };

    const useCase = new AddBreederManagementReviewReplyUseCase(
        breederManagementReviewReplyPort as any,
        new BreederManagementReviewReplyResultMapperService(),
    );

    const mockReview = { _id: 'review-1', breederId: 'breeder-1', replyContent: null };
    const mockReviewWithReply = { _id: 'review-1', breederId: 'breeder-1', replyContent: '기존 답글' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기 답글을 등록한다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReview);
        breederManagementReviewReplyPort.addReply.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', 'review-1', '친절하게 답변드립니다.');

        expect(result.reviewId).toBe('review-1');
        expect(result.replyContent).toBe('친절하게 답변드립니다.');
        expect(result.replyWrittenAt).toBeDefined();
        expect(breederManagementReviewReplyPort.addReply).toHaveBeenCalledWith(
            'review-1',
            expect.objectContaining({ replyContent: '친절하게 답변드립니다.' }),
        );
    });

    it('해당 후기를 찾을 수 없거나 권한이 없으면 BadRequestException을 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(null);

        await expect(useCase.execute('breeder-1', 'nonexistent-review', '답글')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'nonexistent-review', '답글')).rejects.toThrow(
            '해당 후기를 찾을 수 없거나 권한이 없습니다.',
        );
        expect(breederManagementReviewReplyPort.addReply).not.toHaveBeenCalled();
    });

    it('이미 답글이 있으면 BadRequestException을 던진다', async () => {
        breederManagementReviewReplyPort.findReviewByIdAndBreeder.mockResolvedValue(mockReviewWithReply);

        await expect(useCase.execute('breeder-1', 'review-1', '새 답글')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('breeder-1', 'review-1', '새 답글')).rejects.toThrow(
            '이미 답글이 작성되어 있습니다. 수정 기능을 이용해주세요.',
        );
        expect(breederManagementReviewReplyPort.addReply).not.toHaveBeenCalled();
    });
});
