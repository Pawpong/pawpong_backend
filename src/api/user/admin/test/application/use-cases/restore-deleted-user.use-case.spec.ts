import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UserStatus } from '../../../../../../common/enum/user.enum';
import { RestoreDeletedUserUseCase } from '../../../application/use-cases/restore-deleted-user.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminActivityLogFactoryService } from '../../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminDeletedUserCommandResultMapperService } from '../../../domain/services/user-admin-deleted-user-command-result-mapper.service';
import { UserAdminReaderPort } from '../../../application/ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../../../application/ports/user-admin-writer.port';

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

const deletedUser = {
    id: 'user-1',
    nickname: '탈퇴유저',
    emailAddress: 'deleted@example.com',
    accountStatus: UserStatus.DELETED,
    role: 'adopter' as const,
    createdAt: new Date(),
};

function makeReader(admin: any, user: any = null): UserAdminReaderPort {
    return {
        findAdminById: jest.fn().mockResolvedValue(admin),
        getUsers: jest.fn(),
        findManagedUserById: jest.fn().mockResolvedValue(user),
        getDeletedUsers: jest.fn(),
        getDeletedUserStats: jest.fn(),
        listPhoneWhitelist: jest.fn(),
        findPhoneWhitelistById: jest.fn(),
        findPhoneWhitelistByPhoneNumber: jest.fn(),
    };
}

function makeWriter(): UserAdminWriterPort {
    return {
        updateManagedUser: jest.fn().mockResolvedValue(null),
        deleteManagedUser: jest.fn(),
        appendAdminActivityLog: jest.fn().mockResolvedValue(undefined),
        createPhoneWhitelist: jest.fn(),
        updatePhoneWhitelist: jest.fn(),
        deletePhoneWhitelist: jest.fn(),
    };
}

describe('탈퇴 사용자 복구 유스케이스', () => {
    const policy = new UserAdminCommandPolicyService();
    const logFactory = new UserAdminActivityLogFactoryService();
    const resultMapper = new UserAdminDeletedUserCommandResultMapperService();

    it('탈퇴 사용자를 복구하고 결과를 반환한다', async () => {
        const useCase = new RestoreDeletedUserUseCase(
            makeReader(adminWithPermission, deletedUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        const result = await useCase.execute('admin-1', 'user-1', 'adopter');

        expect(result.userId).toBe('user-1');
        expect(result.newStatus).toBe('active');
    });

    it('canManageUsers 권한이 없으면 DomainAuthorizationError를 던진다', async () => {
        const noPermAdmin = { ...adminWithPermission, permissions: { canManageUsers: false } };
        const useCase = new RestoreDeletedUserUseCase(
            makeReader(noPermAdmin, deletedUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        await expect(useCase.execute('admin-1', 'user-1', 'adopter')).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('탈퇴 상태가 아닌 사용자는 DomainValidationError를 던진다', async () => {
        const activeUser = { ...deletedUser, accountStatus: UserStatus.ACTIVE };
        const useCase = new RestoreDeletedUserUseCase(
            makeReader(adminWithPermission, activeUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        await expect(useCase.execute('admin-1', 'user-1', 'adopter')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
