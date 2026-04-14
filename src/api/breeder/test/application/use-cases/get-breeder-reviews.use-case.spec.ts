import { BadRequestException } from '@nestjs/common';

import { GetBreederReviewsUseCase } from '../../../application/use-cases/get-breeder-reviews.use-case';
import { BreederPublicReviewPageAssemblerService } from '../../../domain/services/breeder-public-review-page-assembler.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

describe('브리더 후기 목록 조회 유스케이스', () => {
    const breederPublicReaderPort = {
        findPublicBreederById: jest.fn(),
        findVisibleBreederReviewsByBreederId: jest.fn(),
    };

    const useCase = new GetBreederReviewsUseCase(
        breederPublicReaderPort as any,
        new BreederPublicReviewPageAssemblerService(new BreederPaginationAssemblerService()),
    );

    const mockBreeder = { _id: 'breeder-1', name: '행복브리더', accountStatus: 'active' };
    const mockReview = {
        _id: 'review-1',
        adopterId: { _id: 'adopter-1', nickname: '입양자1' },
        applicationId: { _id: 'app-1', petName: '뭉치' },
        content: '좋은 경험이었습니다.',
        writtenAt: new Date('2026-03-01'),
        type: 'consultation',
        replyContent: null,
        replyWrittenAt: null,
        replyUpdatedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기 목록을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findVisibleBreederReviewsByBreederId.mockResolvedValue({
            reviews: [mockReview],
            total: 1,
        });

        const result = await useCase.execute('breeder-1', 1, 10);

        expect(result.items).toHaveLength(1);
        expect(result.items[0].reviewId).toBe('review-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('후기가 없으면 빈 배열을 반환한다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(mockBreeder);
        breederPublicReaderPort.findVisibleBreederReviewsByBreederId.mockResolvedValue({
            reviews: [],
            total: 0,
        });

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });

    it('브리더를 찾을 수 없으면 BadRequestException을 던진다', async () => {
        breederPublicReaderPort.findPublicBreederById.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더를 찾을 수 없습니다.');
    });
});
