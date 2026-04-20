import { FeedVideoSummaryMapperService } from '../../../domain/services/feed-video-summary-mapper.service';

describe('FeedVideoSummaryMapperService', () => {
    const service = new FeedVideoSummaryMapperService();

    describe('toUploaderResponse', () => {
        it('uploader가 null이면 null을 반환한다', () => {
            expect(service.toUploaderResponse(null)).toBeNull();
        });

        it('uploader가 있으면 _id로 변환하여 반환한다', () => {
            const result = service.toUploaderResponse({
                id: 'user-1',
                name: '브리더A',
                profileImageFileName: 'profile/user-1.jpg',
                businessName: '반려견 농장',
            });

            expect(result).toEqual({
                _id: 'user-1',
                name: '브리더A',
                profileImageFileName: 'profile/user-1.jpg',
                businessName: '반려견 농장',
            });
        });

        it('선택 필드가 없어도 _id만 있으면 반환한다', () => {
            const result = service.toUploaderResponse({ id: 'user-1' });
            expect(result?._id).toBe('user-1');
        });
    });

    describe('toPagination', () => {
        it('기본 페이지네이션 필드를 계산한다', () => {
            const result = service.toPagination(1, 10, 25);
            expect(result).toEqual({
                currentPage: 1,
                pageSize: 10,
                totalItems: 25,
                totalPages: 3,
                hasNextPage: true,
                hasPrevPage: false,
            });
        });

        it('마지막 페이지에서 hasNextPage는 false이고 hasPrevPage는 true다', () => {
            const result = service.toPagination(3, 10, 25);
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPrevPage).toBe(true);
        });

        it('totalCount가 0이면 totalPages도 0이다', () => {
            const result = service.toPagination(1, 10, 0);
            expect(result.totalPages).toBe(0);
            expect(result.hasNextPage).toBe(false);
        });
    });
});
