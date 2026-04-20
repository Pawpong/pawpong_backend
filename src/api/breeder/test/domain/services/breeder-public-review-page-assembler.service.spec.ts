import { BreederPublicReviewPageAssemblerService } from '../../../domain/services/breeder-public-review-page-assembler.service';
import { BreederPaginationAssemblerService } from '../../../domain/services/breeder-pagination-assembler.service';

describe('BreederPublicReviewPageAssemblerService', () => {
    const service = new BreederPublicReviewPageAssemblerService(new BreederPaginationAssemblerService());

    it('리뷰를 매핑하고 페이지네이션을 구성한다', () => {
        const reviews = [
            {
                _id: { toString: () => 'r-1' },
                applicationId: { _id: { toString: () => 'app-1' }, petName: '초코' },
                adopterId: { nickname: '닉' },
                content: '좋아요',
                writtenAt: new Date('2026-01-01'),
                type: 'text',
                replyContent: '감사',
                replyWrittenAt: new Date(),
                replyUpdatedAt: new Date(),
            } as any,
        ];
        const result = service.build(reviews, 1, 1, 10);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].reviewId).toBe('r-1');
        expect(result.items[0].petName).toBe('초코');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('adopterId nickname이 없으면 알 수 없음', () => {
        const reviews = [
            {
                _id: { toString: () => 'r-1' },
                applicationId: undefined,
                adopterId: {},
                content: 'c',
                writtenAt: new Date(),
                type: 't',
            } as any,
        ];
        const result = service.build(reviews, 1, 1, 10);
        expect(result.items[0].adopterName).toBe('알 수 없음');
        expect(result.items[0].applicationId).toBe('');
    });

    it('replyContent가 없으면 null', () => {
        const reviews = [
            {
                _id: { toString: () => 'r-1' },
                adopterId: { nickname: '닉' },
                content: 'c',
                writtenAt: new Date(),
                type: 't',
            } as any,
        ];
        const result = service.build(reviews, 1, 1, 10);
        expect(result.items[0].replyContent).toBeNull();
    });
});
