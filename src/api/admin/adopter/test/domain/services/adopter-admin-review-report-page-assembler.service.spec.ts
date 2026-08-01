import { AdopterAdminReviewReportPageAssemblerService } from '../../../domain/services/adopter-admin-review-report-page-assembler.service';

describe('AdopterAdminReviewReportPageAssemblerService', () => {
    const service = new AdopterAdminReviewReportPageAssemblerService();

    it('snapshot을 페이지네이션 결과로 변환한다', () => {
        const snapshot = {
            items: [
                {
                    reviewId: 'r-1',
                    breederId: 'b-1',
                    breederName: '브리더',
                    authorId: 'a-1',
                    authorName: '작성자',
                    reportedBy: 'u-1',
                    reporterName: '신고자',
                    reportReason: '욕설',
                    reportDescription: '상세',
                    reportedAt: new Date('2026-01-01'),
                    content: '후기',
                    writtenAt: new Date('2026-01-02'),
                    isVisible: true,
                },
            ],
            totalCount: 1,
            page: 1,
            limit: 10,
        } as any;

        const result = service.build(snapshot);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].reviewId).toBe('r-1');
        expect(result.pagination.totalItems).toBe(1);
    });

    it('빈 items도 처리한다', () => {
        const result = service.build({ items: [], totalCount: 0, page: 1, limit: 10 } as any);
        expect(result.items).toEqual([]);
    });
});
