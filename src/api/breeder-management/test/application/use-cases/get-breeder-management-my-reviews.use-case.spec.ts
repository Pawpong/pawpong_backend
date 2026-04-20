import { DomainNotFoundError } from '../../../../../common/error/domain.error';

import { GetBreederManagementMyReviewsUseCase } from '../../../application/use-cases/get-breeder-management-my-reviews.use-case';
import { BreederManagementMyReviewMapperService } from '../../../domain/services/breeder-management-my-review-mapper.service';
import { BreederManagementPaginationAssemblerService } from '../../../domain/services/breeder-management-pagination-assembler.service';

describe('브리더 내 후기 목록 조회 유스케이스', () => {
    const breederManagementListReaderPort = {
        findBreederSummary: jest.fn(),
        findMyReviewsSnapshot: jest.fn(),
    };

    const useCase = new GetBreederManagementMyReviewsUseCase(
        breederManagementListReaderPort as any,
        new BreederManagementMyReviewMapperService(),
        new BreederManagementPaginationAssemblerService(),
    );

    const mockBreederSummary = { _id: 'breeder-1', name: '행복브리더', averageRating: 4.2 };
    const mockReview = {
        _id: 'review-1',
        adopterId: { _id: 'adopter-1', name: '입양자1', nickname: '닉네임1' },
        content: '좋은 경험이었습니다.',
        writtenAt: new Date(),
        type: 'consultation',
        isVisible: true,
        isReported: false,
        replyContent: null,
        replyWrittenAt: null,
        replyUpdatedAt: null,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('정상적으로 후기 목록을 반환한다', async () => {
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(mockBreederSummary);
        breederManagementListReaderPort.findMyReviewsSnapshot.mockResolvedValue({
            reviews: [mockReview],
            filteredTotal: 1,
            totalCount: 5,
            visibleCount: 4,
            hiddenCount: 1,
        });

        const result = await useCase.execute('breeder-1');

        expect(result.items).toHaveLength(1);
        expect(result.items[0].reviewId).toBe('review-1');
        expect(result.averageRating).toBe(4.2);
        expect(result.totalReviews).toBe(5);
        expect(result.visibleReviews).toBe(4);
        expect(result.hiddenReviews).toBe(1);
    });

    it('visibility 필터를 기본값 all로 포트에 전달한다', async () => {
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(mockBreederSummary);
        breederManagementListReaderPort.findMyReviewsSnapshot.mockResolvedValue({
            reviews: [],
            filteredTotal: 0,
            totalCount: 0,
            visibleCount: 0,
            hiddenCount: 0,
        });

        await useCase.execute('breeder-1');

        expect(breederManagementListReaderPort.findMyReviewsSnapshot).toHaveBeenCalledWith('breeder-1', 'all', 1, 10);
    });

    it('브리더를 찾을 수 없으면 도메인 not found 예외를 던진다', async () => {
        breederManagementListReaderPort.findBreederSummary.mockResolvedValue(null);

        await expect(useCase.execute('unknown-id')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('unknown-id')).rejects.toThrow('브리더 정보를 찾을 수 없습니다.');
        expect(breederManagementListReaderPort.findMyReviewsSnapshot).not.toHaveBeenCalled();
    });
});
