import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { ActivateTermsUseCase } from '../../../application/use-cases/activate-terms.use-case';
import { TermsItemMapperService } from '../../../../../service/terms/domain/services/terms-item-mapper.service';

describe('약관 활성화 유스케이스', () => {
    const termsWriter = {
        activate: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new ActivateTermsUseCase(termsWriter as any, new TermsItemMapperService(), logger as any);

    const mockTerms = {
        id: 'terms-1',
        code: 'service' as const,
        version: 'v1.0',
        title: '서비스 이용약관',
        body: '본문',
        isRequired: true,
        isActive: true,
        activatedAt: new Date('2026-04-02T00:00:00.000Z'),
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('약관을 정상 활성화한다', async () => {
        termsWriter.activate.mockResolvedValue(mockTerms);

        const result = await useCase.execute('terms-1', 'admin-1');

        expect(result.termsId).toBe('terms-1');
        expect(result.isActive).toBe(true);
        expect(termsWriter.activate).toHaveBeenCalledWith('terms-1');
    });

    it('약관 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'admin-1')).rejects.toThrow(DomainValidationError);
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('terms-1', '')).rejects.toThrow(DomainValidationError);
    });

    it('약관이 없으면 DomainNotFoundError를 던진다', async () => {
        termsWriter.activate.mockResolvedValue(null);

        await expect(useCase.execute('terms-1', 'admin-1')).rejects.toThrow(DomainNotFoundError);
    });
});
