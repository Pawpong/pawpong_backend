import { GetAllAnnouncementsUseCase } from '../../../application/use-cases/get-all-announcements.use-case';
import { AnnouncementPageAssemblerService } from '../../../../domain/services/announcement-page-assembler.service';
import { AnnouncementItemMapperService } from '../../../../domain/services/announcement-item-mapper.service';
import { AnnouncementPaginationAssemblerService } from '../../../../domain/services/announcement-pagination-assembler.service';

describe('공지사항 전체 목록 조회 유스케이스 (관리자)', () => {
    const announcementAdminReader = {
        findAllAnnouncements: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const assemblerService = new AnnouncementPageAssemblerService(
        new AnnouncementItemMapperService(),
        new AnnouncementPaginationAssemblerService(),
    );

    const useCase = new GetAllAnnouncementsUseCase(announcementAdminReader as any, assemblerService, logger as any);

    const mockAnnouncement = {
        announcementId: 'ann-1',
        title: '공지사항 제목',
        content: '공지사항 내용',
        isActive: true,
        order: 1,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공지사항 목록을 페이지네이션으로 반환한다', async () => {
        announcementAdminReader.findAllAnnouncements.mockResolvedValue({
            items: [mockAnnouncement],
            totalCount: 1,
            page: 1,
            limit: 10,
        });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(1);
        expect(result.items[0].announcementId).toBe('ann-1');
        expect(result.items[0].title).toBe('공지사항 제목');
    });

    it('page와 limit 기본값(1, 10)으로 조회한다', async () => {
        announcementAdminReader.findAllAnnouncements.mockResolvedValue({
            items: [],
            totalCount: 0,
            page: 1,
            limit: 10,
        });

        await useCase.execute({});

        expect(announcementAdminReader.findAllAnnouncements).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('공지사항이 없으면 빈 목록을 반환한다', async () => {
        announcementAdminReader.findAllAnnouncements.mockResolvedValue({
            items: [],
            totalCount: 0,
            page: 1,
            limit: 10,
        });

        const result = await useCase.execute({ page: 1, limit: 10 });

        expect(result.items).toHaveLength(0);
    });

    it('조회 중 예외가 발생하면 원본 예외를 전파한다', async () => {
        announcementAdminReader.findAllAnnouncements.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('DB 오류');
    });
});
