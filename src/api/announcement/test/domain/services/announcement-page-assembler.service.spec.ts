import { AnnouncementPageAssemblerService } from '../../../domain/services/announcement-page-assembler.service';
import { AnnouncementItemMapperService } from '../../../domain/services/announcement-item-mapper.service';
import { AnnouncementPaginationAssemblerService } from '../../../domain/services/announcement-pagination-assembler.service';

describe('AnnouncementPageAssemblerService', () => {
    const service = new AnnouncementPageAssemblerService(
        new AnnouncementItemMapperService(),
        new AnnouncementPaginationAssemblerService(),
    );

    it('AnnouncementPublicListResult를 페이지네이션 결과로 변환한다', () => {
        const result = service.build({
            items: [
                {
                    announcementId: 'a-1',
                    title: 't',
                    content: 'c',
                    isActive: true,
                    order: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            totalCount: 1,
            page: 1,
            limit: 10,
        });
        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
    });
});
