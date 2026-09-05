import { UserStatus } from '../../../../../common/enum/user.enum';

export type UserAdminPhoneWhitelistCreateCommand = {
    phoneNumber: string;
    description: string;
};

export type UserAdminPhoneWhitelistUpdateCommand = {
    description?: string;
    isActive?: boolean;
};

export type UserAdminDeletedUserSearchQuery = {
    page?: number;
    limit?: number;
    role?: 'all' | 'adopter' | 'breeder';
    deleteReason?: string;
};

export type UserAdminUserSearchQuery = {
    userRole?: string;
    accountStatus?: UserStatus;
    searchKeyword?: string;
    page?: number;
    limit?: number;
};

export type UserAdminStatusUpdateCommand = {
    accountStatus: UserStatus;
    actionReason?: string;
};
