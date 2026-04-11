import type {
    AnnouncementPublicListResult,
    AnnouncementPublicReaderPort,
} from '../../../application/ports/announcement-public-reader.port';
import { PaginationRequestDto } from '../../../../../common/dto/pagination/pagination-request.dto';
import { AnnouncementPaginationAssemblerService } from '../../../domain/services/announcement-pagination-assembler.service';
import { AnnouncementResponseMapperService } from '../../../domain/services/announcement-response-mapper.service';
import { GetActiveAnnouncementsUseCase } from '../../../application/use-cases/get-active-announcements.use-case';

class StubAnnouncementPublicReaderPort implements AnnouncementPublicReaderPort {
    listResult: AnnouncementPublicListResult = {
        items: [
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
        totalCount: 1,
        page: 1,
        limit: 10,
    };

    async findActiveAnnouncements(): Promise<AnnouncementPublicListResult> {
        return this.listResult;
    }

    async findActiveAnnouncementById() {
        return this.listResult.items[0];
    }
}

describe('활성 공지사항 조회 유스케이스', () => {
    it('공지사항 목록 응답 계약을 유지한다', async () => {
        const useCase = new GetActiveAnnouncementsUseCase(
            new StubAnnouncementPublicReaderPort(),
            new AnnouncementResponseMapperService(new AnnouncementPaginationAssemblerService()),
        );

        const paginationDto = Object.assign(new PaginationRequestDto(), { page: 1, limit: 10 });
        const result = await useCase.execute(paginationDto);

        expect(result.items).toHaveLength(1);
        expect(result.items[0]).toMatchObject({
            announcementId: 'announcement-1',
            title: '공지 1',
            content: '내용 1',
            isActive: true,
            order: 1,
        });
        expect(result.pagination).toMatchObject({
            currentPage: 1,
            pageSize: 10,
            totalItems: 1,
            totalPages: 1,
        });
    });
});
