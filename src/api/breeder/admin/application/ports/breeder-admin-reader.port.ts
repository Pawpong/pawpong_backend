export interface BreederAdminPermissionSnapshot {
    canManageBreeders?: boolean;
}

export interface BreederAdminActivityLogSnapshot {
    logId: string;
    action: string;
    targetType: string;
    targetId: string;
    targetName?: string;
    description: string;
    performedAt: Date;
}

export interface BreederAdminAdminSnapshot {
    id: string;
    name: string;
    permissions?: BreederAdminPermissionSnapshot;
    activityLogs?: BreederAdminActivityLogSnapshot[];
}

export interface BreederAdminBreederSnapshot {
    id: string;
    name: string;
    nickname?: string;
    emailAddress?: string;
    accountStatus: string;
    suspensionReason?: string;
    suspendedAt?: Date;
    isTestAccount: boolean;
    verification?: {
        status?: string;
    };
}

export const BREEDER_ADMIN_READER = Symbol('BREEDER_ADMIN_READER');

export interface BreederAdminReaderPort {
    findAdminById(adminId: string): Promise<BreederAdminAdminSnapshot | null>;
    findBreederById(breederId: string): Promise<BreederAdminBreederSnapshot | null>;
}
