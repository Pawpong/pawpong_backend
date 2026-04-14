import { BadRequestException } from '@nestjs/common';

import { GetAdopterReviewDetailUseCase } from '../../../application/use-cases/get-adopter-review-detail.use-case';
import { AdopterReviewDetailMapperService } from '../../../domain/services/adopter-review-detail-mapper.service';

describe('입양자 후기 상세 조회 유스케이스', () => {
    const adopterReviewReaderPort = {
        findDetailByAdopterId: jest.fn(),
    };

    const useCase = new GetAdopterReviewDetailUseCase(
        adopterReviewReaderPort as any,
        new AdopterReviewDetailMapperService(),
    );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('후기가 존재하면 상세 정보를 반환한다', async () => {
        adopterReviewReaderPort.findDetailByAdopterId.mockResolvedValue({
            reviewId: 'review-1',
            breederNickname: '행복브리더',
            breederProfileImageFileName: 'profile.jpg',
            breederLevel: 'elite',
            breedingPetType: 'dog',
            content: '친절하고 좋았어요.',
            reviewType: 'positive',
            writtenAt: new Date('2026-04-01T00:00:00.000Z'),
            isVisible: true,
        });

        const result = await useCase.execute('user-1', 'review-1');

        expect(result.reviewId).toBe('review-1');
        expect(result.content).toBe('친절하고 좋았어요.');
        expect(adopterReviewReaderPort.findDetailByAdopterId).toHaveBeenCalledWith('user-1', 'review-1');
    });

    it('후기가 없으면 BadRequestException을 던진다', async () => {
        adopterReviewReaderPort.findDetailByAdopterId.mockResolvedValue(null);

        await expect(useCase.execute('user-1', 'review-1')).rejects.toThrow(BadRequestException);
        await expect(useCase.execute('user-1', 'review-1')).rejects.toThrow('후기를 찾을 수 없습니다.');
    });

    it('userId와 reviewId를 포트에 정확히 전달한다', async () => {
        adopterReviewReaderPort.findDetailByAdopterId.mockResolvedValue({
            reviewId: 'review-99',
            breederNickname: null,
            breederProfileImageFileName: null,
            breederLevel: null,
            breedingPetType: null,
            content: '내용',
            reviewType: 'positive',
            writtenAt: new Date(),
            isVisible: true,
        });

        await useCase.execute('user-99', 'review-99');

        expect(adopterReviewReaderPort.findDetailByAdopterId).toHaveBeenCalledWith('user-99', 'review-99');
    });
});
