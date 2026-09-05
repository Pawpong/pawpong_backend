import { DomainAuthorizationError } from '../../../../../../common/error/domain.error';
import { GetUsersUseCase } from '../../../application/use-cases/get-users.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminUserPageAssemblerService } from '../../../domain/services/user-admin-user-page-assembler.service';
import { UserAdminPaginationAssemblerService } from '../../../domain/services/user-admin-pagination-assembler.service';
import { UserAdminReaderPort } from '../../../application/ports/user-admin-reader.port';

function makeReader(admin: any, users: any = { items: [], total: 0 }): UserAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getUsers: jest.fn().mockResolvedValue(users),
        findManagedUserById: jest.fn(),
        getDeletedUsers: jest.fn(),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn(),
        findPhoneWhitelistById: jest.fn(),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

const adminWithPermission = {
    id: 'admin-1',
    name: '관리자',
    email: 'admin@example.com',
    status: 'active',
    adminLevel: 'admin',
    permissions: { canManageUsers: true },
    activityLogs: [],
    createdAt: new Date(),
};

describe('사용자 목록 조회 유스케이스', () => {
    const pageAssembler = new UserAdminUserPageAssemblerService(new UserAdminPaginationAssemblerService());

    it('관리자 권한이 있으면 사용자 목록을 반환한다', async () => {
        const useCase = new GetUsersUseCase(
            makeReader(adminWithPermission, { items: [], total: 0 }),
            new UserAdminCommandPolicyService(),
            pageAssembler,
        );

        const result = await useCase.execute('admin-1', {});

        expect(result.items).toEqual([]);
    });

    it('canManageUsers 권한이 없으면 DomainAuthorizationError를 던진다', async () => {
        const noPermAdmin = { ...adminWithPermission, permissions: { canManageUsers: false } };
        const useCase = new GetUsersUseCase(
            makeReader(noPermAdmin),
            new UserAdminCommandPolicyService(),
            pageAssembler,
        );

        await expect(useCase.execute('admin-1', {})).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('관리자가 없으면 DomainAuthorizationError를 던진다', async () => {
        const useCase = new GetUsersUseCase(makeReader(null), new UserAdminCommandPolicyService(), pageAssembler);

        await expect(useCase.execute('not-found', {})).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
