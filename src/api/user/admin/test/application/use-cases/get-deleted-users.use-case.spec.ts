import { DomainAuthorizationError } from '../../../../../../common/error/domain.error';
import { GetDeletedUsersUseCase } from '../../../application/use-cases/get-deleted-users.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminActivityLogFactoryService } from '../../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminDeletedUserPageAssemblerService } from '../../../domain/services/user-admin-deleted-user-page-assembler.service';
import { UserAdminPaginationAssemblerService } from '../../../domain/services/user-admin-pagination-assembler.service';
import { UserAdminReaderPort } from '../../../application/ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../../../application/ports/user-admin-writer.port';

function makeReader(admin: any, result: any = { items: [], total: 0 }): UserAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getUsers: jest.fn(),
        findManagedUserById: jest.fn(),
        getDeletedUsers: jest.fn().mockResolvedValue(result),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn(),
        findPhoneWhitelistById: jest.fn(),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

function makeWriter(): UserAdminWriterPort {
    return {
        updateManagedUser: jest.fn(),
        deleteManagedUser: jest.fn(),
        appendAdminActivityLog: jest.fn().mockResolvedValue(undefined),
        createPhoneWhitelist: jest.fn(),
        updatePhoneWhitelist: jest.fn(),
        deletePhoneWhitelist: jest.fn(),
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

describe('탈퇴 사용자 목록 조회 유스케이스', () => {
    const pageAssembler = new UserAdminDeletedUserPageAssemblerService(new UserAdminPaginationAssemblerService());
    const logFactory = new UserAdminActivityLogFactoryService();

    it('관리자 권한이 있으면 탈퇴 사용자 목록을 반환한다', async () => {
        const useCase = new GetDeletedUsersUseCase(
            makeReader(adminWithPermission, { items: [], total: 0 }),
            makeWriter(),
            new UserAdminCommandPolicyService(),
            logFactory,
            pageAssembler,
        );

        const result = await useCase.execute('admin-1', {});

        expect(result.items).toEqual([]);
    });

    it('canManageUsers 권한이 없으면 DomainAuthorizationError를 던진다', async () => {
        const noPermAdmin = { ...adminWithPermission, permissions: { canManageUsers: false } };
        const useCase = new GetDeletedUsersUseCase(
            makeReader(noPermAdmin),
            makeWriter(),
            new UserAdminCommandPolicyService(),
            logFactory,
            pageAssembler,
        );

        await expect(useCase.execute('admin-1', {})).rejects.toBeInstanceOf(DomainAuthorizationError);
    });
});
