import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { DeleteTermsUseCase } from '../../../application/use-cases/delete-terms.use-case';

describe('약관 삭제 유스케이스', () => {
    const termsWriter = {
        delete: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new DeleteTermsUseCase(termsWriter as any, logger as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('약관을 정상 삭제한다', async () => {
        termsWriter.delete.mockResolvedValue(true);

        await useCase.execute('terms-1', 'admin-1');

        expect(termsWriter.delete).toHaveBeenCalledWith('terms-1');
    });

    it('약관 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'admin-1')).rejects.toThrow(DomainValidationError);
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('terms-1', '')).rejects.toThrow(DomainValidationError);
    });

    it('약관이 없으면 DomainNotFoundError를 던진다', async () => {
        termsWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute('terms-1', 'admin-1')).rejects.toThrow(DomainNotFoundError);
    });
});
