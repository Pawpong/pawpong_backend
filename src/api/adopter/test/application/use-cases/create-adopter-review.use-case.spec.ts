import { BadRequestException } from '@nestjs/common';

import { CreateAdopterReviewUseCase } from '../../../application/use-cases/create-adopter-review.use-case';
import { ApplicationStatus } from '../../../../../common/enum/user.enum';

describe('입양자 후기 작성 유스케이스', () => {
    const adopterProfilePort = { findById: jest.fn() };
    const adopterBreederReaderPort = { findById: jest.fn() };
    const adopterReviewCommandPort = {
        findApplicationById: jest.fn(),
        create: jest.fn(),
        incrementBreederReviewCount: jest.fn(),
    };
    const adopterReviewNotifierPort = {
        notifyBreederOfNewReview: jest.fn(),
    };

    const useCase = new CreateAdopterReviewUseCase(
        adopterProfilePort as any,
        adopterBreederReaderPort as any,
        adopterReviewCommandPort as any,
        adopterReviewNotifierPort as any,
    );

    const mockAdopter = { userId: 'user-1', nickname: '입양자1' };
    const mockApplication = {
        _id: { toString: () => 'app-1' },
        adopterId: { toString: () => 'user-1' },
        breederId: { toString: () => 'breeder-1' },
        status: ApplicationStatus.CONSULTATION_COMPLETED,
    };
    const mockBreeder = { _id: { toString: () => 'breeder-1' }, name: '행복브리더' };
    const mockSavedReview = {
        _id: { toString: () => 'review-1' },
        applicationId: { toString: () => 'app-1' },
        breederId: { toString: () => 'breeder-1' },
        type: 'positive',
        writtenAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기를 작성한다', async () => {
        adopterProfilePort.findById.mockResolvedValue(mockAdopter);
        adopterReviewCommandPort.findApplicationById.mockResolvedValue(mockApplication);
        adopterBreederReaderPort.findById.mockResolvedValue(mockBreeder);
        adopterReviewCommandPort.create.mockResolvedValue(mockSavedReview);
        adopterReviewCommandPort.incrementBreederReviewCount.mockResolvedValue(undefined);
        adopterReviewNotifierPort.notifyBreederOfNewReview.mockResolvedValue(undefined);

        const result = await useCase.execute('user-1', {
            applicationId: 'app-1',
            reviewType: 'positive',
            content: '정말 친절하셨어요.',
        });

        expect(result.reviewId).toBe('review-1');
        expect(result.reviewType).toBe('positive');
        expect(adopterReviewCommandPort.incrementBreederReviewCount).toHaveBeenCalledWith('breeder-1');
        expect(adopterReviewNotifierPort.notifyBreederOfNewReview).toHaveBeenCalledWith('breeder-1');
    });

    it('입양자 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow(BadRequestException);
        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow('입양자 정보를 찾을 수 없습니다.');
    });

    it('신청 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(mockAdopter);
        adopterReviewCommandPort.findApplicationById.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow('해당 입양 신청을 찾을 수 없습니다.');
    });

    it('다른 사람의 신청에 후기를 작성하면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(mockAdopter);
        adopterReviewCommandPort.findApplicationById.mockResolvedValue({
            ...mockApplication,
            adopterId: { toString: () => 'other-user' },
        });

        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow('본인의 입양 신청에 대해서만 후기를 작성할 수 있습니다.');
    });

    it('상담 완료 상태가 아니면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(mockAdopter);
        adopterReviewCommandPort.findApplicationById.mockResolvedValue({
            ...mockApplication,
            status: ApplicationStatus.CONSULTATION_PENDING,
        });

        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow('상담이 완료된 신청에 대해서만 후기를 작성할 수 있습니다.');
    });

    it('브리더 정보가 없으면 BadRequestException을 던진다', async () => {
        adopterProfilePort.findById.mockResolvedValue(mockAdopter);
        adopterReviewCommandPort.findApplicationById.mockResolvedValue(mockApplication);
        adopterBreederReaderPort.findById.mockResolvedValue(null);

        await expect(
            useCase.execute('user-1', { applicationId: 'app-1', reviewType: 'positive', content: '후기' }),
        ).rejects.toThrow('해당 브리더를 찾을 수 없습니다.');
    });
});
