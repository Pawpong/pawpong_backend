import { BadRequestException } from '@nestjs/common';

import { GetAdopterReviewsUseCase } from '../../../application/use-cases/get-adopter-reviews.use-case';
import { AdopterReviewPageAssemblerService } from '../../../domain/services/adopter-review-page-assembler.service';
import { AdopterPaginationAssemblerService } from '../../../domain/services/adopter-pagination-assembler.service';

describe('입양자 후기 목록 조회 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterReviewReaderPort = {
        countByAdopterId: jest.fn(),
        findPagedByAdopterId: jest.fn(),
    };

    const useCase = new GetAdopterReviewsUseCase(
        adopterProfilePort as any,
        adopterReviewReaderPort as any,
        new AdopterReviewPageAssemblerService(new AdopterPaginationAssemblerService()),
    );

    const mockReview = {
        reviewId: 'review-1',
        applicationId: 'app-1',
        breederId: 'breeder-1',
        breederNickname: '행복브리더',
        breederProfileImageFileName: null,
        breederLevel: 'new',
        breedingPetType: 'dog',
        content: '좋았어요.',
        reviewType: 'positive',
        writtenAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('후기 목록을 페이지네이션으로 정상 조회한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterReviewReaderPort.countByAdopterId.mockResolvedValue(1);
        adopterReviewReaderPort.findPagedByAdopterId.mockResolvedValue([mockReview]);

        const result = await useCase.execute('user-1', 1, 10);

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
        expect(result.items[0].reviewId).toBe('review-1');
        expect(result.items[0].content).toBe('좋았어요.');
    });

    it('입양자 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 1, 10)).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('user-1', 1, 10)).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('후기가 없으면 빈 목록을 반환한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterReviewReaderPort.countByAdopterId.mockResolvedValue(0);
        adopterReviewReaderPort.findPagedByAdopterId.mockResolvedValue([]);

        const result = await useCase.execute('user-1', 1, 10);

        expect(result.items).toHaveLength(0);
        expect(result.pagination.totalItems).toBe(0);
    });

    it('기본 페이지 파라미터로 호출한다', async () => {
        adopterProfilePort.findById.mockResolvedValue({ userId: 'user-1' });
        adopterReviewReaderPort.countByAdopterId.mockResolvedValue(0);
        adopterReviewReaderPort.findPagedByAdopterId.mockResolvedValue([]);

        await useCase.execute('user-1');

        expect(adopterReviewReaderPort.findPagedByAdopterId).toHaveBeenCalledWith('user-1', 1, 10);
    });
});
