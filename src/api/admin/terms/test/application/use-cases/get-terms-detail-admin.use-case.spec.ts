import { DomainNotFoundError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { GetTermsDetailAdminUseCase } from '../../../application/use-cases/get-terms-detail-admin.use-case';
import { TermsItemMapperService } from '../../../../../service/terms/domain/services/terms-item-mapper.service';

describe('약관 상세 조회 유스케이스 (관리자)', () => {
    const termsWriter = {
        findById: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new GetTermsDetailAdminUseCase(termsWriter as any, new TermsItemMapperService(), logger as any);

    const mockTerms = {
        id: 'terms-1',
        code: 'service' as const,
        version: 'v1.0',
        title: '서비스 이용약관',
        body: '본문',
        isRequired: true,
        isActive: false,
        activatedAt: null,
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-01T00:00:00.000Z'),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('비활성 버전도 상세 조회한다', async () => {
        termsWriter.findById.mockResolvedValue(mockTerms);

        const result = await useCase.execute('terms-1');

        expect(result.termsId).toBe('terms-1');
    });

    it('약관 ID가 없으면 DomainValidationError를 던진다', async () => {
        await expect(useCase.execute('')).rejects.toThrow(DomainValidationError);
    });

    it('약관이 없으면 DomainNotFoundError를 던진다', async () => {
        termsWriter.findById.mockResolvedValue(null);

        await expect(useCase.execute('terms-1')).rejects.toThrow(DomainNotFoundError);
    });
});
