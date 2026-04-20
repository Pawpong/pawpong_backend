import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { CreateNoticeUseCase } from '../../../application/use-cases/create-notice.use-case';
import { NoticeItemMapperService } from '../../../../domain/services/notice-item-mapper.service';

describe('공지사항 생성 유스케이스', () => {
    const noticeWriter = {
        create: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new CreateNoticeUseCase(
        noticeWriter as any,
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
        viewCount: 0,
        publishedAt: new Date('2026-04-01T00:00:00.000Z'),
        expiredAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공지사항을 정상 생성한다', async () => {
        noticeWriter.create.mockResolvedValue(mockNotice);

        const result = await useCase.execute('admin-1', '관리자', {
            title: '공지 제목',
            content: '공지 내용',
            status: 'published',
        });

        expect(result.noticeId).toBe('notice-1');
        expect(noticeWriter.create).toHaveBeenCalledWith('admin-1', '관리자', expect.any(Object));
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(
            useCase.execute('', '관리자', { title: '공지 제목', content: '공지 내용', status: 'published' }),
        ).rejects.toThrow(DomainValidationError);
    });

    it('생성 중 저장소 오류가 나면 원본을 전파한다', async () => {
        noticeWriter.create.mockRejectedValue(new Error('DB 오류'));

        await expect(
            useCase.execute('admin-1', '관리자', { title: '공지 제목', content: '공지 내용', status: 'published' }),
        ).rejects.toThrow('DB 오류');
    });
});
