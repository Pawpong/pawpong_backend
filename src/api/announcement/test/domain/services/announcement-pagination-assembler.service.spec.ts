import { AnnouncementPaginationAssemblerService } from '../../../domain/services/announcement-pagination-assembler.service';

describe('공지사항 페이지네이션 조립 서비스', () => {
    it('공지사항 페이지네이션 응답 계약을 유지한다', () => {
        const service = new AnnouncementPaginationAssemblerService();

        expect(
            service.build(
                [
                    {
                        announcementId: 'announcement-1',
                        title: '공지 1',
                        content: '내용 1',
                        isActive: true,
                        order: 1,
                        createdAt: new Date('2026-01-01T00:00:00.000Z'),
                        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
                    },
                ],
                1,
                10,
                1,
            ),
        ).toMatchObject({
            items: [
                {
                    announcementId: 'announcement-1',
                    title: '공지 1',
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
