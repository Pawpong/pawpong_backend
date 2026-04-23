import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdateNoticeUseCase } from '../../../application/use-cases/update-notice.use-case';
import { NoticeItemMapperService } from '../../../../domain/services/notice-item-mapper.service';

describe('공지사항 수정 유스케이스', () => {
    const noticeWriter = {
        update: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new UpdateNoticeUseCase(noticeWriter as any, new NoticeItemMapperService(), logger as any);

    const mockNotice = {
        id: 'notice-1',
        title: '수정된 공지 제목',
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

    it('공지사항을 정상 수정한다', async () => {
        noticeWriter.update.mockResolvedValue(mockNotice);

        const result = await useCase.execute('notice-1', 'admin-1', { title: '수정된 공지 제목' });

        expect(result.noticeId).toBe('notice-1');
        expect(noticeWriter.update).toHaveBeenCalledWith('notice-1', { title: '수정된 공지 제목' });
    });

    it('공지사항 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'admin-1', { title: '수정' })).rejects.toThrow(DomainValidationError);
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('notice-1', '', { title: '수정' })).rejects.toThrow(DomainValidationError);
    });

    it('공지사항이 없으면 DomainNotFoundError를 던진다', async () => {
        noticeWriter.update.mockResolvedValue(null);

        await expect(useCase.execute('notice-1', 'admin-1', { title: '수정' })).rejects.toThrow(DomainNotFoundError);
    });

    it('수정 중 저장소 오류가 나면 원본을 전파한다', async () => {
        noticeWriter.update.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute('notice-1', 'admin-1', { title: '수정' })).rejects.toThrow('DB 오류');
    });
});
