import type {
    UserAdminActivityLogSnapshot,
    UserAdminAdminPermissionsSnapshot,
    UserAdminDeletedReasonStatSnapshot,
    UserAdminManagedUserRole,
    UserAdminManagedUserStatisticsSnapshot,
} from '../application/ports/user-admin-reader.port';

export type UserAdminObjectIdLike = {
    toString(): string;
};

export type UserAdminAdminDocumentRecord = {
    _id: UserAdminObjectIdLike;
    name: string;
    email: string;
    profileImage?: string;
    status: string;
    adminLevel: string;
    permissions?: UserAdminAdminPermissionsSnapshot;
    activityLogs?: UserAdminActivityLogSnapshot[];
    createdAt: Date;
    lastLoginAt?: Date;
};

export type UserAdminManagedUserDocumentRecord = {
    _id: UserAdminObjectIdLike;
    nickname?: string;
    name?: string;
    full_name?: string;
    emailAddress: string;
    accountStatus: string;
    lastLoginAt?: Date;
    createdAt?: Date;
    stats?: UserAdminManagedUserStatisticsSnapshot;
    deletedAt?: Date;
    deleteReason?: string;
    deleteReasonDetail?: string;
    phoneNumber?: string;
};

export type UserAdminManagedUserListItemRecord = UserAdminManagedUserDocumentRecord & {
    role: UserAdminManagedUserRole;
};

export type UserAdminDeletedUserListItemRecord = UserAdminManagedUserDocumentRecord & {
    userRole: UserAdminManagedUserRole;
};

export type UserAdminDeletedReasonAggregateRecord = UserAdminDeletedReasonStatSnapshot & {
    _id: string;
};

export type UserAdminDeletedOtherReasonDocumentRecord = {
    deleteReasonDetail?: string;
    deletedAt?: Date;
};

export type UserAdminDeletedUserStatsDocumentRecord = {
    totalDeletedAdopters: number;
    totalDeletedBreeders: number;
    adopterReasonStats: UserAdminDeletedReasonAggregateRecord[];
    breederReasonStats: UserAdminDeletedReasonAggregateRecord[];
    adopterOtherReasons: UserAdminDeletedOtherReasonDocumentRecord[];
    breederOtherReasons: UserAdminDeletedOtherReasonDocumentRecord[];
    last7DaysCount: number;
    last30DaysCount: number;
};

export type UserAdminPhoneWhitelistDocumentRecord = {
    _id: UserAdminObjectIdLike;
    phoneNumber: string;
    description: string;
    isActive: boolean;
    createdBy?: string;
    createdAt?: Date;
    updatedAt?: Date;
};
