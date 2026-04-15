import { DomainNotFoundError, DomainValidationError } from '../../../../../common/error/domain.error';
import { NoticeItemMapperService } from '../../../domain/services/notice-item-mapper.service';
import { GetNoticeDetailUseCase } from '../../../application/use-cases/get-notice-detail.use-case';

describe('공지사항 상세 조회 유스케이스', () => {
    const noticeReader = {
        readById: jest.fn(),
        incrementViewCount: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new GetNoticeDetailUseCase(
        noticeReader as any,
        new NoticeItemMapperService(),
        logger as any,
    );

    const mockNotice = {
        id: 'notice-1',
        title: '공지 제목',
        content: '공지 내용',
        authorName: '관리자',
        status: 'published',
        isPinned: false,
        viewCount: 3,
        publishedAt: new Date('2026-04-01T00:00:00.000Z'),
        expiredAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공지사항을 정상 조회한다', async () => {
        noticeReader.readById.mockResolvedValue(mockNotice);
        noticeReader.incrementViewCount.mockResolvedValue(undefined);

        const result = await useCase.execute('notice-1');

        expect(result.noticeId).toBe('notice-1');
        expect(noticeReader.incrementViewCount).toHaveBeenCalledWith('notice-1');
    });

    it('공지사항 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('')).rejects.toThrow(DomainValidationError);
        await expect(useCase.execute('')).rejects.toThrow('공지사항 ID가 필요합니다.');
    });

    it('공지사항이 없으면 DomainNotFoundError를 던진다', async () => {
        noticeReader.readById.mockResolvedValue(null);

        await expect(useCase.execute('notice-1')).rejects.toThrow(DomainNotFoundError);
        await expect(useCase.execute('notice-1')).rejects.toThrow('공지사항을 찾을 수 없습니다.');
    });

    it('저장소 오류는 원본을 전파한다', async () => {
        noticeReader.readById.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute('notice-1')).rejects.toThrow('DB 오류');
    });
});
