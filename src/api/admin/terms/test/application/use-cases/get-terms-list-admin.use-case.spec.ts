import { GetTermsListAdminUseCase } from '../../../application/use-cases/get-terms-list-admin.use-case';
import { TermsItemMapperService } from '../../../../../service/terms/domain/services/terms-item-mapper.service';

describe('약관 전체 목록 조회 유스케이스 (관리자)', () => {
    const termsWriter = {
        findAll: jest.fn(),
    };
    const logger = {
        logStart: jest.fn(),
        logSuccess: jest.fn(),
        logError: jest.fn(),
    };

    const useCase = new GetTermsListAdminUseCase(termsWriter as any, new TermsItemMapperService(), logger as any);

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

    it('비활성 버전을 포함해 전체 목록을 반환한다', async () => {
        termsWriter.findAll.mockResolvedValue([mockTerms]);

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0].isActive).toBe(false);
    });

    it('목록이 비어있으면 빈 배열을 반환한다', async () => {
        termsWriter.findAll.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toHaveLength(0);
    });
});
