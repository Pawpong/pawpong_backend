import { AdminAction, AdminLevel, AdminTargetType, UserStatus } from '../../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../../common/error/domain.error';
import { UserAdminCommandPolicyService } from '../../../domain/services/user-admin-command-policy.service';

describe('UserAdminCommandPolicyService', () => {
    const policy = new UserAdminCommandPolicyService();

    describe('assertAdminExists', () => {
        it('admin이 있으면 반환한다', () => {
            const admin = { id: 'a-1' } as any;
            expect(policy.assertAdminExists(admin)).toBe(admin);
        });
        it('null이면 DomainValidationError', () => {
            expect(() => policy.assertAdminExists(null)).toThrow(DomainValidationError);
        });
    });

    describe('assertCanManageUsers', () => {
        it('권한 있으면 반환한다', () => {
            const admin = { id: 'a-1', permissions: { canManageUsers: true } } as any;
            expect(policy.assertCanManageUsers(admin, 'denied')).toBe(admin);
        });
        it('권한 없으면 DomainAuthorizationError', () => {
            expect(() => policy.assertCanManageUsers(null, 'denied')).toThrow(DomainAuthorizationError);
            expect(() => policy.assertCanManageUsers({ permissions: {} } as any, 'denied')).toThrow(
                DomainAuthorizationError,
            );
        });
    });

    describe('assertSuperAdmin', () => {
        it('SUPER_ADMIN 레벨이면 통과', () => {
            const admin = { adminLevel: AdminLevel.SUPER_ADMIN } as any;
            expect(policy.assertSuperAdmin(admin)).toBe(admin);
        });
        it('다른 레벨이면 예외', () => {
            expect(() => policy.assertSuperAdmin({ adminLevel: AdminLevel.BREEDER_ADMIN } as any)).toThrow(
                DomainAuthorizationError,
            );
            expect(() => policy.assertSuperAdmin(null)).toThrow(DomainAuthorizationError);
        });
    });

    describe('assertManagedUserExists', () => {
        it('user가 있으면 반환', () => {
            const user = { id: 'u-1' } as any;
            expect(policy.assertManagedUserExists('adopter', user)).toBe(user);
        });
        it('role별 메시지를 사용한다', () => {
            expect(() => policy.assertManagedUserExists('adopter', null)).toThrow('입양자');
            expect(() => policy.assertManagedUserExists('breeder', null)).toThrow('브리더');
        });
    });

    describe('assertDeletedUser / assertHardDeleteAllowed', () => {
        it('DELETED 상태면 통과', () => {
            expect(() => policy.assertDeletedUser({ accountStatus: UserStatus.DELETED } as any)).not.toThrow();
            expect(() => policy.assertHardDeleteAllowed({ accountStatus: UserStatus.DELETED } as any)).not.toThrow();
        });
        it('다른 상태면 예외', () => {
            expect(() => policy.assertDeletedUser({ accountStatus: UserStatus.ACTIVE } as any)).toThrow(
                DomainValidationError,
            );
            expect(() => policy.assertHardDeleteAllowed({ accountStatus: UserStatus.ACTIVE } as any)).toThrow(
                DomainValidationError,
            );
        });
    });

    describe('PhoneWhitelist', () => {
        it('assertPhoneWhitelistDoesNotExist: null이면 통과, 존재하면 예외', () => {
            expect(() => policy.assertPhoneWhitelistDoesNotExist(null)).not.toThrow();
            expect(() => policy.assertPhoneWhitelistDoesNotExist({ id: '1' } as any)).toThrow('이미');
        });
        it('assertPhoneWhitelistExists: 존재하면 반환, null이면 예외', () => {
            const item = { id: '1' } as any;
            expect(policy.assertPhoneWhitelistExists(item)).toBe(item);
            expect(() => policy.assertPhoneWhitelistExists(null)).toThrow(DomainValidationError);
        });
    });

    describe('resolveAdminAction', () => {
        it('SUSPENDED → SUSPEND_USER', () => {
            expect(policy.resolveAdminAction(UserStatus.SUSPENDED)).toBe(AdminAction.SUSPEND_USER);
        });
        it('DELETED → DELETE_USER', () => {
            expect(policy.resolveAdminAction(UserStatus.DELETED)).toBe(AdminAction.DELETE_USER);
        });
        it('그 외 → ACTIVATE_USER', () => {
            expect(policy.resolveAdminAction('active')).toBe(AdminAction.ACTIVATE_USER);
        });
    });

    describe('resolveTargetType', () => {
        it('adopter → ADOPTER', () => {
            expect(policy.resolveTargetType('adopter')).toBe(AdminTargetType.ADOPTER);
        });
        it('breeder → BREEDER', () => {
            expect(policy.resolveTargetType('breeder')).toBe(AdminTargetType.BREEDER);
        });
    });

    describe('getManagedUserDisplayName', () => {
        it('breeder는 name 우선, nickname 차선, 없으면 알 수 없음', () => {
            expect(policy.getManagedUserDisplayName('breeder', { name: '이름' } as any)).toBe('이름');
            expect(policy.getManagedUserDisplayName('breeder', { nickname: '닉' } as any)).toBe('닉');
            expect(policy.getManagedUserDisplayName('breeder', {} as any)).toBe('알 수 없음');
        });
        it('adopter는 nickname 우선, name 차선', () => {
            expect(policy.getManagedUserDisplayName('adopter', { nickname: '닉', name: '이름' } as any)).toBe('닉');
            expect(policy.getManagedUserDisplayName('adopter', { name: '이름' } as any)).toBe('이름');
        });
    });
});
