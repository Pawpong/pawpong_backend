import { AdminAction, AdminTargetType } from '../../../../../common/enum/user.enum';
import {
    UserAdminManagedUserRole,
    UserAdminManagedUserSnapshot,
    UserAdminPhoneWhitelistSnapshot,
} from './user-admin-reader.port';

export interface UserAdminManagedUserPatch {
    accountStatus?: string;
    deletedAt?: Date | undefined;
    deleteReason?: string | undefined;
    deleteReasonDetail?: string | undefined;
    suspensionReason?: string | undefined;
    suspendedAt?: Date | undefined;
}

export interface UserAdminActivityLogEntry {
    logId: string;
    action: AdminAction;
    targetType: AdminTargetType;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export interface UserAdminPhoneWhitelistCreateCommand {
    phoneNumber: string;
    description: string;
    createdBy: string;
}

export interface UserAdminPhoneWhitelistUpdateCommand {
    description?: string;
    isActive?: boolean;
}

export const USER_ADMIN_WRITER = Symbol('USER_ADMIN_WRITER');

export interface UserAdminWriterPort {
    updateManagedUser(
        role: UserAdminManagedUserRole,
        userId: string,
        patch: UserAdminManagedUserPatch,
    ): Promise<UserAdminManagedUserSnapshot | null>;
    deleteManagedUser(role: UserAdminManagedUserRole, userId: string): Promise<boolean>;
    appendAdminActivityLog(adminId: string, logEntry: UserAdminActivityLogEntry): Promise<void>;
    createPhoneWhitelist(command: UserAdminPhoneWhitelistCreateCommand): Promise<UserAdminPhoneWhitelistSnapshot>;
    updatePhoneWhitelist(
        id: string,
        command: UserAdminPhoneWhitelistUpdateCommand,
    ): Promise<UserAdminPhoneWhitelistSnapshot | null>;
    deletePhoneWhitelist(id: string): Promise<boolean>;
}
