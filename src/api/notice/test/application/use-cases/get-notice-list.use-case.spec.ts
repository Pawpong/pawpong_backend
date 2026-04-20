import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { NoticePageAssemblerService } from '../../../domain/services/notice-page-assembler.service';
import { NoticePaginationAssemblerService } from '../../../domain/services/notice-pagination-assembler.service';
import { GetNoticeListUseCase } from '../../../application/use-cases/get-notice-list.use-case';

describe('공지사항 목록 조회 유스케이스', () => {
    const noticeReader = {
        countByStatus: jest.fn(),
        readPage: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new GetNoticeListUseCase(
        noticeReader as any,
        new NoticePageAssemblerService(new NoticeItemMapperService(), new NoticePaginationAssemblerService()),
        logger as any,
    );

    const mockNotice = {
        id: 'notice-1',
        title: '공지 제목',
        content: '공지 내용',
        authorName: '관리자',
        status: 'published',
        isPinned: false,
        viewCount: 0,
        publishedAt: new Date('2026-04-01T00:00:00.000Z'),
        expiredAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공지사항 목록을 페이지네이션으로 반환한다', async () => {
        noticeReader.countByStatus.mockResolvedValue(1);
        noticeReader.readPage.mockResolvedValue([mockNotice]);

        const result = await useCase.execute({ page: 1, limit: 10 }, 'published');

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
        expect(noticeReader.readPage).toHaveBeenCalledWith(0, 10, 'published');
    });

    it('조회 중 저장소 오류가 나면 원본을 전파한다', async () => {
        noticeReader.countByStatus.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute({ page: 1, limit: 10 })).rejects.toThrow('DB 오류');
    });
});
