export type UserAdminManagedUserRole = 'adopter' | 'breeder';
export type UserAdminDeletedUserRole = 'all' | UserAdminManagedUserRole;

export interface UserAdminAdminSnapshot {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    status: string;
    adminLevel: string;
    permissions?: {
        canManageUsers?: boolean;
    };
    activityLogs?: Array<Record<string, any>>;
    createdAt?: Date;
}

export interface UserAdminUserSearchCriteria {
    userRole?: UserAdminManagedUserRole;
    accountStatus?: string;
    searchKeyword?: string;
    page: number;
    limit: number;
}

export interface UserAdminManagedUserSnapshot {
    id: string;
    nickname?: string;
    name?: string;
    fullName?: string;
    emailAddress: string;
    accountStatus: string;
    lastLoginAt?: Date;
    createdAt?: Date;
    stats?: Record<string, any>;
    deletedAt?: Date;
    deleteReason?: string;
    deleteReasonDetail?: string;
    phoneNumber?: string;
}

export interface UserAdminUserListResultSnapshot {
    items: Array<UserAdminManagedUserSnapshot & { role: UserAdminManagedUserRole }>;
    total: number;
}

export interface UserAdminDeletedUserSearchCriteria {
    role: UserAdminDeletedUserRole;
    deleteReason?: string;
    page: number;
    limit: number;
}

export interface UserAdminDeletedUserListResultSnapshot {
    items: Array<UserAdminManagedUserSnapshot & { userRole: UserAdminManagedUserRole }>;
    total: number;
}

export interface UserAdminDeletedReasonStatSnapshot {
    reason: string;
    count: number;
}

export interface UserAdminOtherReasonDetailSnapshot {
    userType: UserAdminManagedUserRole;
    reason: string;
    deletedAt: string;
}

export interface UserAdminDeletedUserStatsSnapshot {
    totalDeletedAdopters: number;
    totalDeletedBreeders: number;
    adopterReasonStats: UserAdminDeletedReasonStatSnapshot[];
    breederReasonStats: UserAdminDeletedReasonStatSnapshot[];
    otherReasonDetails: UserAdminOtherReasonDetailSnapshot[];
    last7DaysCount: number;
    last30DaysCount: number;
}

export interface UserAdminPhoneWhitelistSnapshot {
    id: string;
    phoneNumber: string;
    description: string;
    isActive: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const USER_ADMIN_READER = Symbol('USER_ADMIN_READER');

export interface UserAdminReaderPort {
    findAdminById(adminId: string): Promise<UserAdminAdminSnapshot | null>;
    getUsers(criteria: UserAdminUserSearchCriteria): Promise<UserAdminUserListResultSnapshot>;
    findManagedUserById(role: UserAdminManagedUserRole, userId: string): Promise<UserAdminManagedUserSnapshot | null>;
    getDeletedUsers(criteria: UserAdminDeletedUserSearchCriteria): Promise<UserAdminDeletedUserListResultSnapshot>;
    getDeletedUserStats(): Promise<UserAdminDeletedUserStatsSnapshot>;
    listPhoneWhitelist(): Promise<UserAdminPhoneWhitelistSnapshot[]>;
    findPhoneWhitelistById(id: string): Promise<UserAdminPhoneWhitelistSnapshot | null>;
    findPhoneWhitelistByPhoneNumber(phoneNumber: string): Promise<UserAdminPhoneWhitelistSnapshot | null>;
}
