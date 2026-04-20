import { DomainAuthorizationError } from '../../../../../../../common/error/domain.error';
import { GetBreedersUseCase } from '../../../application/use-cases/get-breeders.use-case';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminBreederItemMapperService } from '../../../domain/services/breeder-verification-admin-breeder-item-mapper.service';
import { BreederVerificationAdminListItemMapperService } from '../../../domain/services/breeder-verification-admin-list-item-mapper.service';
import { BreederPaginationAssemblerService } from '../../../../../domain/services/breeder-pagination-assembler.service';
import { BreederVerificationAdminReaderPort, BreederVerificationAdminBreederSnapshot } from '../../../application/ports/breeder-verification-admin-reader.port';

const adminWithPermission = { id: 'admin-1', name: '관리자', permissions: { canManageBreeders: true } };

function makeBreederSnapshot(overrides: Partial<BreederVerificationAdminBreederSnapshot> = {}): BreederVerificationAdminBreederSnapshot {
    return {
        id: 'breeder-1',
        nickname: '브리더A',
        emailAddress: 'breeder@example.com',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...overrides,
    };
}

function makeReader(items: BreederVerificationAdminBreederSnapshot[] = [], total = 0, admin: any = adminWithPermission): BreederVerificationAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getLevelChangeRequests: jest.fn(),
        getPendingBreeders: jest.fn(),
        getBreeders: jest.fn().mockResolvedValue({ items, total }),
        findBreederById: jest.fn(),
        getApprovedBreederStats: jest.fn(),
        findApprovedBreedersMissingDocuments: jest.fn(),
    };
}

describe('브리더 목록 조회 유스케이스', () => {
    const policy = new BreederVerificationAdminPolicyService();
    const listItemMapper = new BreederVerificationAdminListItemMapperService();
    const breederItemMapper = new BreederVerificationAdminBreederItemMapperService(listItemMapper);
    const paginationAssembler = new BreederPaginationAssemblerService();

    it('브리더 목록을 반환한다', async () => {
        const useCase = new GetBreedersUseCase(makeReader([makeBreederSnapshot()], 1), policy, breederItemMapper, paginationAssembler);

        const result = await useCase.execute('admin-1', { pageNumber: 1, itemsPerPage: 10 });

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
    });

    it('브리더가 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetBreedersUseCase(makeReader([], 0), policy, breederItemMapper, paginationAssembler);

        const result = await useCase.execute('admin-1', {});

        expect(result.items).toEqual([]);
    });

    it('권한이 없는 관리자는 DomainAuthorizationError를 던진다', async () => {
        const useCase = new GetBreedersUseCase(
            makeReader([], 0, { id: 'admin-2', name: '관리자', permissions: { canManageBreeders: false } }),
            policy,
            breederItemMapper,
            paginationAssembler,
        );

        await expect(useCase.execute('admin-2', {})).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
