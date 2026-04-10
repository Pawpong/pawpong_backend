import type { PageResult } from '../../../../../common/types/page-result.type';

export type UserAdminUserManagementItemResult = {
    userId: string;
    userName: string;
    emailAddress: string;
    userRole: string;
    accountStatus: string;
    lastLoginAt: Date;
    createdAt: Date;
    statisticsInfo?: any;
};

export type UserAdminUserManagementPageResult = PageResult<UserAdminUserManagementItemResult>;

export type UserAdminDeletedUserItemResult = {
    userId: string;
    email: string;
    nickname: string;
    userRole: 'adopter' | 'breeder';
    deleteReason: string;
    deleteReasonDetail?: string;
    deletedAt: string;
    createdAt: string;
    phone?: string;
};

export type UserAdminDeletedUserPageResult = PageResult<UserAdminDeletedUserItemResult>;

export type UserAdminDeletedReasonStatResult = {
    reason: string;
    reasonLabel: string;
    count: number;
    percentage: number;
};

export type UserAdminDeletedUserStatsResult = {
    totalDeletedUsers: number;
    totalDeletedAdopters: number;
    totalDeletedBreeders: number;
    adopterReasonStats: UserAdminDeletedReasonStatResult[];
    breederReasonStats: UserAdminDeletedReasonStatResult[];
    otherReasonDetails: Array<{
        userType: 'adopter' | 'breeder';
        reason: string;
        deletedAt: string;
    }>;
    last7DaysCount: number;
    last30DaysCount: number;
};

export type UserAdminPhoneWhitelistItemResult = {
    id: string;
    phoneNumber: string;
    description: string;
    isActive: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
};

export type UserAdminPhoneWhitelistListResult = {
    items: UserAdminPhoneWhitelistItemResult[];
    total: number;
};

export type UserAdminStatusUpdateResult = {
    userId: string;
    role: string;
    previousStatus: string;
    newStatus: string;
    reason?: string;
    updatedAt: string;
    suspensionUntil?: string;
    message: string;
};

export type UserAdminHardDeleteResult = {
    userId: string;
    role: string;
    userName: string;
    userEmail: string;
    deletedAt: string;
    message: string;
};
