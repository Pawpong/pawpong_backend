import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { CreateTermsUseCase } from '../../../application/use-cases/create-terms.use-case';
import { TermsItemMapperService } from '../../../../../service/terms/domain/services/terms-item-mapper.service';

describe('약관 생성 유스케이스', () => {
    const termsWriter = {
        create: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new CreateTermsUseCase(termsWriter as any, new TermsItemMapperService(), logger as any);

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

    it('약관을 정상 생성한다', async () => {
        termsWriter.create.mockResolvedValue(mockTerms);

        const result = await useCase.execute('admin-1', {
            code: 'service',
            version: 'v1.0',
            title: '서비스 이용약관',
            body: '본문',
        });

        expect(result.termsId).toBe('terms-1');
        expect(termsWriter.create).toHaveBeenCalledWith(expect.objectContaining({ code: 'service', version: 'v1.0' }));
    });

    it('관리자 정보가 없으면 DomainValidationError를 던진다', async () => {
        await expect(
            useCase.execute('', { code: 'service', version: 'v1.0', title: '제목', body: '본문' }),
        ).rejects.toThrow(DomainValidationError);
    });

    it('생성 중 저장소 오류가 나면 원본을 전파한다', async () => {
        termsWriter.create.mockRejectedValue(new Error('DB 오류'));

        await expect(
            useCase.execute('admin-1', { code: 'service', version: 'v1.0', title: '제목', body: '본문' }),
        ).rejects.toThrow('DB 오류');
    });
});
