import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UpdateTermsUseCase } from '../../../application/use-cases/update-terms.use-case';
import { TermsItemMapperService } from '../../../../../service/terms/domain/services/terms-item-mapper.service';

describe('약관 수정 유스케이스', () => {
    const termsWriter = {
        update: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new UpdateTermsUseCase(termsWriter as any, new TermsItemMapperService(), logger as any);

    const mockTerms = {
        id: 'terms-1',
        code: 'service' as const,
        version: 'v1.0',
        title: '수정된 제목',
        body: '본문',
        isRequired: true,
        isActive: false,
        activatedAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('약관을 정상 수정한다', async () => {
        termsWriter.update.mockResolvedValue(mockTerms);

        const result = await useCase.execute('terms-1', 'admin-1', { title: '수정된 제목' });

        expect(result.termsId).toBe('terms-1');
        expect(termsWriter.update).toHaveBeenCalledWith('terms-1', { title: '수정된 제목' });
    });

    it('약관 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('', 'admin-1', { title: '수정' })).rejects.toThrow(DomainValidationError);
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('terms-1', '', { title: '수정' })).rejects.toThrow(DomainValidationError);
    });

    it('약관이 없으면 DomainNotFoundError를 던진다', async () => {
        termsWriter.update.mockResolvedValue(null);

        await expect(useCase.execute('terms-1', 'admin-1', { title: '수정' })).rejects.toThrow(DomainNotFoundError);
    });
});
