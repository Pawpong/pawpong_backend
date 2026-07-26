import { NoticePaginationAssemblerService } from '../../../domain/services/notice-pagination-assembler.service';

describe('공지사항 페이지네이션 조립 서비스', () => {
    it('공지사항 목록 페이지네이션 응답 계약을 유지한다', () => {
        const service = new NoticePaginationAssemblerService();

        expect(
            service.build(
                [
                    {
                        noticeId: 'notice-1',
                        title: '공지사항',
                        content: '내용',
                        authorName: '관리자',
                        status: 'published',
                        isPinned: true,
                        viewCount: 3,
                        publishedAt: '2026-04-09T00:00:00.000Z',
                        expiredAt: undefined,
                        createdAt: '2026-04-09T00:00:00.000Z',
                        updatedAt: '2026-04-09T00:00:00.000Z',
                    },
                ],
                1,
                10,
                1,
            ),
        ).toMatchObject({
            items: [
                {
                    noticeId: 'notice-1',
                    title: '공지사항',
                },
            ],
            pagination: {
                currentPage: 1,
                pageSize: 10,
                totalItems: 1,
                totalPages: 1,
            },
        });
    });
});
