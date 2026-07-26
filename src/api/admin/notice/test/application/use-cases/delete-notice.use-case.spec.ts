import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { DeleteNoticeUseCase } from '../../../application/use-cases/delete-notice.use-case';

describe('공지사항 삭제 유스케이스', () => {
    const noticeWriter = {
        delete: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new DeleteNoticeUseCase(noticeWriter as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('공지사항을 정상 삭제한다', async () => {
        noticeWriter.delete.mockResolvedValue(true);

        await expect(useCase.execute('notice-1', 'admin-1')).resolves.toBeUndefined();
        expect(noticeWriter.delete).toHaveBeenCalledWith('notice-1');
    });

    it('공지사항 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'admin-1')).rejects.toThrow(DomainValidationError);
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('notice-1', '')).rejects.toThrow(DomainValidationError);
    });

    it('공지사항이 없으면 DomainNotFoundError를 던진다', async () => {
        noticeWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute('notice-1', 'admin-1')).rejects.toThrow(DomainNotFoundError);
    });

    it('삭제 중 저장소 오류가 나면 원본을 전파한다', async () => {
        noticeWriter.delete.mockRejectedValue(new Error('DB 오류'));

        await expect(useCase.execute('notice-1', 'admin-1')).rejects.toThrow('DB 오류');
    });
});
