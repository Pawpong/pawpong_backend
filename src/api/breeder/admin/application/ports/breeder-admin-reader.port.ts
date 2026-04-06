export interface BreederAdminAdminSnapshot {
    id: string;
    name: string;
    permissions?: {
        canManageBreeders?: boolean;
    };
    activityLogs?: Array<Record<string, any>>;
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
