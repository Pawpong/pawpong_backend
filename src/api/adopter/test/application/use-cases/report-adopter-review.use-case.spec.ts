import { BadRequestException } from '@nestjs/common';

import { ReportAdopterReviewUseCase } from '../../../application/use-cases/report-adopter-review.use-case';
import { ADOPTER_RESPONSE_PAYLOAD_MESSAGES } from '../../../constants/adopter-response-messages';

describe('후기 신고 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterReviewCommandPort = {
        findReviewById: jest.fn(),
        markAsReported: jest.fn(),
    };

    const useCase = new ReportAdopterReviewUseCase(
        adopterProfilePort as any,
        adopterBreederReaderPort as any,
        adopterReviewCommandPort as any,
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('입양자가 후기를 정상 신고한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ nickname: '신고자' });
        adopterBreederReaderPort.findById.mockResolvedValue(null);
        adopterReviewCommandPort.findReviewById.mockResolvedValue({ _id: 'review-1' });
        adopterReviewCommandPort.markAsReported.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', {
            reviewId: 'review-1',
            reason: 'inappropriate_content',
            description: '부적절한 내용',
        });

        expect(result.message).toBe(ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reviewReported);
        expect(adopterReviewCommandPort.markAsReported).toHaveBeenCalledWith(
            'review-1',
            'user-1',
            'inappropriate_content',
            '부적절한 내용',
            expect.any(Date),
        );
    });

    it('브리더도 후기를 신고할 수 있다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);
        adopterBreederReaderPort.findById.mockResolvedValue({ name: '브리더신고자' });
        adopterReviewCommandPort.findReviewById.mockResolvedValue({ _id: 'review-1' });
        adopterReviewCommandPort.markAsReported.mockResolvedValue(undefined);

        const result = await useCase.execute('breeder-1', {
            reviewId: 'review-1',
            reason: 'false_info',
        });

        expect(result.message).toBe(ADOPTER_RESPONSE_PAYLOAD_MESSAGES.reviewReported);
    });

    it('입양자와 브리더 모두 찾을 수 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);
        adopterBreederReaderPort.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('unknown-user', { reviewId: 'review-1', reason: 'inappropriate_content' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('unknown-user', { reviewId: 'review-1', reason: 'inappropriate_content' }),
        ).rejects.toThrow('사용자 정보를 찾을 수 없습니다.');
    });

    it('신고할 후기가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ nickname: '신고자' });
        adopterBreederReaderPort.findById.mockResolvedValue(null);
        adopterReviewCommandPort.findReviewById.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { reviewId: 'nonexistent-review', reason: 'false_info' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { reviewId: 'nonexistent-review', reason: 'false_info' }),
        ).rejects.toThrow('신고할 후기를 찾을 수 없습니다.');
    });

    it('description이 없으면 빈 문자열로 처리한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ nickname: '신고자' });
        adopterBreederReaderPort.findById.mockResolvedValue(null);
        adopterReviewCommandPort.findReviewById.mockResolvedValue({ _id: 'review-1' });
        adopterReviewCommandPort.markAsReported.mockResolvedValue(undefined);

        await useCase.execute('user-1', { reviewId: 'review-1', reason: 'inappropriate_content' });

        expect(adopterReviewCommandPort.markAsReported).toHaveBeenCalledWith(
            'review-1',
            'user-1',
            'inappropriate_content',
            '',
            expect.any(Date),
        );
    });
});
