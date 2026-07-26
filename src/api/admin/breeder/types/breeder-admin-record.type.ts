import type { BreederAdminActivityLogEntry } from '../application/ports/breeder-admin-writer.port';
import type {
    BreederVerificationAdminDocumentSnapshot,
    BreederVerificationAdminLevelChangeHistorySnapshot,
    BreederVerificationAdminLevelChangeRequestSnapshot,
    BreederVerificationAdminProfileSnapshot,
    BreederVerificationAdminVerificationSnapshot,
} from '../verification/application/ports/breeder-verification-admin-reader.port';

export type BreederAdminObjectIdLike = {
    toString(): string;
};

export type BreederAdminPermissionSnapshot = {
    canManageBreeders?: boolean;
};

export type BreederAdminAdminDocumentRecord = {
    _id: BreederAdminObjectIdLike;
    name: string;
    permissions?: BreederAdminPermissionSnapshot;
    activityLogs?: BreederAdminActivityLogEntry[];
};

export type BreederAdminBreederVerificationRecord = BreederVerificationAdminVerificationSnapshot & {
    documents?: BreederVerificationAdminDocumentSnapshot[];
    levelChangeRequest?: BreederVerificationAdminLevelChangeRequestSnapshot;
    levelChangeHistory?: BreederVerificationAdminLevelChangeHistorySnapshot[];
};

export type BreederAdminBreederDocumentRecord = {
    _id: BreederAdminObjectIdLike;
    name?: string;
    nickname?: string;
    emailAddress?: string;
    phoneNumber?: string;
    accountStatus?: string;
    suspensionReason?: string;
    suspendedAt?: Date;
    isTestAccount?: boolean;
    verification?: BreederAdminBreederVerificationRecord;
    profile?: BreederVerificationAdminProfileSnapshot;
    breeds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
};

export type BreederAdminReportRecord = {
    reportId: string;
    type: string;
    description: string;
    status: string;
    reportedAt: Date;
    adminNotes?: string;
};

export type BreederAdminReportOwnerDocumentRecord = {
    _id: BreederAdminObjectIdLike;
    name?: string;
    nickname?: string;
    reports?: BreederAdminReportRecord[];
};

export type BreederAdminReportListItemRecord = {
    reportId: string;
    targetId?: BreederAdminObjectIdLike;
    targetName?: string;
    type: string;
    description: string;
    status: string;
    reportedAt: Date;
    adminNotes?: string;
};

export type BreederAdminReportAggregateResult = {
    items?: BreederAdminReportListItemRecord[];
    totalCount?: Array<{ total: number }>;
};
