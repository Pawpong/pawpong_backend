import { DomainAuthorizationError } from '../../../../../../../common/error/domain.error';
import { GetLevelChangeRequestsUseCase } from '../../../application/use-cases/get-level-change-requests.use-case';
import { BreederVerificationAdminPolicyService } from '../../../domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminLevelChangeItemMapperService } from '../../../domain/services/breeder-verification-admin-level-change-item-mapper.service';
import { BreederVerificationAdminListItemMapperService } from '../../../domain/services/breeder-verification-admin-list-item-mapper.service';
import { BreederPaginationAssemblerService } from '../../../../../domain/services/breeder-pagination-assembler.service';
import {
    BreederVerificationAdminReaderPort,
    BreederVerificationAdminBreederSnapshot,
} from '../../../application/ports/breeder-verification-admin-reader.port';

const adminWithPermission = { id: 'admin-1', name: '관리자', permissions: { canManageBreeders: true } };

function makeBreederSnapshot(): BreederVerificationAdminBreederSnapshot {
    return {
        id: 'breeder-1',
        nickname: '브리더A',
        emailAddress: 'breeder@example.com',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        verification: {
            isLevelChangeRequested: true,
            levelChangeRequest: {
                previousLevel: 'new',
                requestedLevel: 'elite',
                requestedAt: new Date('2026-01-01T00:00:00.000Z'),
            },
        },
    };
}

function makeReader(
    items: BreederVerificationAdminBreederSnapshot[] = [],
    total = 0,
    admin: any = adminWithPermission,
): BreederVerificationAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getLevelChangeRequests: jest.fn().mockResolvedValue({ items, total }),
        getPendingBreeders: jest.fn(),
        getBreeders: jest.fn(),
        findBreederById: jest.fn(),
        getApprovedBreederStats: jest.fn(),
        findApprovedBreedersMissingDocuments: jest.fn(),
    };
}

describe('레벨 변경 요청 목록 조회 유스케이스', () => {
    const policy = new BreederVerificationAdminPolicyService();
    const listItemMapper = new BreederVerificationAdminListItemMapperService();
    const levelChangeMapper = new BreederVerificationAdminLevelChangeItemMapperService(listItemMapper);
    const paginationAssembler = new BreederPaginationAssemblerService();

    it('레벨 변경 요청 목록을 반환한다', async () => {
        const useCase = new GetLevelChangeRequestsUseCase(
            makeReader([makeBreederSnapshot()], 1),
            policy,
            levelChangeMapper,
            paginationAssembler,
        );

        const result = await useCase.execute('admin-1', { pageNumber: 1, itemsPerPage: 10 });

        expect(result.items).toHaveLength(1);
        expect(result.pagination.totalItems).toBe(1);
    });

    it('요청이 없으면 빈 목록을 반환한다', async () => {
        const useCase = new GetLevelChangeRequestsUseCase(
            makeReader([], 0),
            policy,
            levelChangeMapper,
            paginationAssembler,
        );

        const result = await useCase.execute('admin-1', {});

        expect(result.items).toEqual([]);
    });

    it('권한이 없으면 DomainAuthorizationError를 던진다', async () => {
        const useCase = new GetLevelChangeRequestsUseCase(
            makeReader([], 0, { id: 'admin-2', name: '관리자', permissions: { canManageBreeders: false } }),
            policy,
            levelChangeMapper,
            paginationAssembler,
        );

        await expect(useCase.execute('admin-2', {})).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
