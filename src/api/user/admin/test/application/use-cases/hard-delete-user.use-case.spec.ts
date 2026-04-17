import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { AdminLevel, UserStatus } from '../../../../../../common/enum/user.enum';
import { HardDeleteUserUseCase } from '../../../application/use-cases/hard-delete-user.use-case';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';
import { UserAdminActivityLogFactoryService } from '../../../domain/services/user-admin-activity-log-factory.service';
import { UserAdminDeletedUserCommandResultMapperService } from '../../../domain/services/user-admin-deleted-user-command-result-mapper.service';
import { UserAdminReaderPort } from '../../../application/ports/user-admin-reader.port';
import { UserAdminWriterPort } from '../../../application/ports/user-admin-writer.port';

const superAdmin = {
    id: 'admin-1',
    name: '슈퍼관리자',
    email: 'super@example.com',
    status: 'active',
    adminLevel: AdminLevel.SUPER_ADMIN,
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
        updateManagedUser: jest.fn(),
        deleteManagedUser: jest.fn().mockResolvedValue(true),
        appendAdminActivityLog: jest.fn().mockResolvedValue(undefined),
        createPhoneWhitelist: jest.fn(),
        updatePhoneWhitelist: jest.fn(),
        deletePhoneWhitelist: jest.fn(),
    };
}

describe('사용자 영구 삭제 유스케이스', () => {
    const policy = new UserAdminCommandPolicyService();
    const logFactory = new UserAdminActivityLogFactoryService();
    const resultMapper = new UserAdminDeletedUserCommandResultMapperService();

    it('탈퇴 상태 사용자를 영구 삭제하고 결과를 반환한다', async () => {
        const useCase = new HardDeleteUserUseCase(
            makeReader(superAdmin, deletedUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        const result = await useCase.execute('admin-1', 'user-1', 'adopter');

        expect(result.userId).toBe('user-1');
    });

    it('super_admin이 아니면 DomainAuthorizationError를 던진다', async () => {
        const regularAdmin = { ...superAdmin, adminLevel: 'admin' };
        const useCase = new HardDeleteUserUseCase(
            makeReader(regularAdmin, deletedUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        await expect(useCase.execute('admin-1', 'user-1', 'adopter')).rejects.toBeInstanceOf(DomainAuthorizationError);
    });

    it('탈퇴 상태가 아닌 사용자는 DomainValidationError를 던진다', async () => {
        const activeUser = { ...deletedUser, accountStatus: UserStatus.ACTIVE };
        const useCase = new HardDeleteUserUseCase(
            makeReader(superAdmin, activeUser),
            makeWriter(),
            policy,
            logFactory,
            resultMapper,
        );

        await expect(useCase.execute('admin-1', 'user-1', 'adopter')).rejects.toBeInstanceOf(DomainValidationError);
    });
});
