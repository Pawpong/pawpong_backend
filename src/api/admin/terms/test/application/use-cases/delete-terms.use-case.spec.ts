import {
    DomainConflictError,
    DomainNotFoundError,
    DomainValidationError,
} from '../../../../../../common/error/domain.error';
import { DeleteTermsUseCase } from '../../../application/use-cases/delete-terms.use-case';

describe('약관 삭제 유스케이스', () => {
    const termsWriter = {
        findById: jest.fn(),
        delete: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new DeleteTermsUseCase(termsWriter as any, logger as any);

    const inactiveTerms = {
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
        termsWriter.findById.mockResolvedValue(inactiveTerms);
        termsWriter.delete.mockResolvedValue(true);
    });

    it('비활성 약관은 정상 삭제한다', async () => {
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
        termsWriter.findById.mockResolvedValue(null);

        await expect(useCase.execute('terms-1', 'admin-1')).rejects.toThrow(DomainNotFoundError);
        expect(termsWriter.delete).not.toHaveBeenCalled();
    });

    // 활성 약관이 사라지면 입양자 가입이 "등록된 활성 약관이 없습니다" 로 통째로 막힌다 (2026-09-14 운영 장애)
    it('활성 상태인 약관은 DomainConflictError(409)로 막고 삭제하지 않는다', async () => {
        termsWriter.findById.mockResolvedValue({ ...inactiveTerms, isActive: true });

        await expect(useCase.execute('terms-1', 'admin-1')).rejects.toThrow(DomainConflictError);
        expect(termsWriter.delete).not.toHaveBeenCalled();
    });

    it('삭제 직전에 사라졌으면 DomainNotFoundError를 던진다', async () => {
        termsWriter.delete.mockResolvedValue(false);

        await expect(useCase.execute('terms-1', 'admin-1')).rejects.toThrow(DomainNotFoundError);
    });
});
