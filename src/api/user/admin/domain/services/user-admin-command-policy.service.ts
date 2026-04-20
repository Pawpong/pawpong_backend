import { Injectable } from '@nestjs/common';

import { AdminAction, AdminLevel, AdminTargetType, UserStatus } from '../../../../../common/enum/user.enum';
import { DomainAuthorizationError, DomainValidationError } from '../../../../../common/error/domain.error';
import {
    UserAdminAdminSnapshot,
    UserAdminManagedUserRole,
    UserAdminManagedUserSnapshot,
    UserAdminPhoneWhitelistSnapshot,
} from '../../application/ports/user-admin-reader.port';

@Injectable()
export class UserAdminCommandPolicyService {
    assertAdminExists(admin: UserAdminAdminSnapshot | null): UserAdminAdminSnapshot {
        if (!admin) {
            throw new DomainValidationError('관리자를 찾을 수 없습니다.');
        }

        return admin;
    }

    assertCanManageUsers(admin: UserAdminAdminSnapshot | null, message: string): UserAdminAdminSnapshot {
        if (!admin || !admin.permissions?.canManageUsers) {
            throw new DomainAuthorizationError(message);
        }

        return admin;
    }

    assertSuperAdmin(admin: UserAdminAdminSnapshot | null): UserAdminAdminSnapshot {
        if (!admin || admin.adminLevel !== AdminLevel.SUPER_ADMIN) {
            throw new DomainAuthorizationError('super_admin 권한이 필요합니다.');
        }

        return admin;
    }

    assertManagedUserExists(
        role: UserAdminManagedUserRole,
        user: UserAdminManagedUserSnapshot | null,
    ): UserAdminManagedUserSnapshot {
        if (!user) {
            throw new DomainValidationError(this.getManagedUserNotFoundMessage(role));
        }

        return user;
    }

    assertDeletedUser(user: UserAdminManagedUserSnapshot): void {
        if (user.accountStatus !== UserStatus.DELETED) {
            throw new DomainValidationError('탈퇴 상태가 아닌 사용자입니다.');
        }
    }

    assertHardDeleteAllowed(user: UserAdminManagedUserSnapshot): void {
        if (user.accountStatus !== UserStatus.DELETED) {
            throw new DomainValidationError('deleted 상태의 사용자만 영구 삭제할 수 있습니다.');
        }
    }

    assertPhoneWhitelistDoesNotExist(item: UserAdminPhoneWhitelistSnapshot | null): void {
        if (item) {
            throw new DomainValidationError('이미 화이트리스트에 등록된 전화번호입니다.');
        }
    }

    assertPhoneWhitelistExists(item: UserAdminPhoneWhitelistSnapshot | null): UserAdminPhoneWhitelistSnapshot {
        if (!item) {
            throw new DomainValidationError('화이트리스트를 찾을 수 없습니다.');
        }

        return item;
    }

    resolveAdminAction(accountStatus: string): AdminAction {
        if (accountStatus === UserStatus.SUSPENDED) {
            return AdminAction.SUSPEND_USER;
        }

        if (accountStatus === UserStatus.DELETED) {
            return AdminAction.DELETE_USER;
        }

        return AdminAction.ACTIVATE_USER;
    }

    resolveTargetType(role: UserAdminManagedUserRole): AdminTargetType {
        return role === 'adopter' ? AdminTargetType.ADOPTER : AdminTargetType.BREEDER;
    }

    getManagedUserNotFoundMessage(role: UserAdminManagedUserRole): string {
        return `${role === 'adopter' ? '입양자를' : '브리더를'} 찾을 수 없습니다.`;
    }

    getManagedUserDisplayName(role: UserAdminManagedUserRole, user: UserAdminManagedUserSnapshot): string {
        if (role === 'breeder') {
            return user.name || user.nickname || '알 수 없음';
        }

        return user.nickname || user.name || '알 수 없음';
    }
}
