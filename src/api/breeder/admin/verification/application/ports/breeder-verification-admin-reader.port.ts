export interface BreederVerificationAdminAdminSnapshot {
    id: string;
    name: string;
    permissions?: {
        canManageBreeders?: boolean;
    };
}

export interface BreederVerificationAdminDocumentSnapshot {
    type: string;
    fileName: string;
    uploadedAt?: Date;
    originalFileName?: string;
}

export interface BreederVerificationAdminLevelChangeRequestSnapshot {
    previousLevel: string;
    requestedLevel: string;
    requestedAt: Date;
    documents?: BreederVerificationAdminDocumentSnapshot[];
}

export interface BreederVerificationAdminLevelChangeHistorySnapshot {
    previousLevel: string;
    newLevel: string;
    requestedAt: Date;
    approvedAt?: Date;
    approvedBy?: string;
}

export interface BreederVerificationAdminVerificationSnapshot {
    status?: string;
    plan?: string;
    level?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    submittedByEmail?: boolean;
    documents?: BreederVerificationAdminDocumentSnapshot[];
    isLevelChangeRequested?: boolean;
    levelChangeRequest?: BreederVerificationAdminLevelChangeRequestSnapshot;
    levelChangeHistory?: BreederVerificationAdminLevelChangeHistorySnapshot[];
}

export interface BreederVerificationAdminProfileSnapshot {
    location?: {
        city?: string;
        district?: string;
        address?: string;
    };
    specialization?: string[];
    description?: string;
    experienceYears?: number;
}

export interface BreederVerificationAdminBreederSnapshot {
    id: string;
    name?: string;
    nickname: string;
    emailAddress: string;
    phoneNumber?: string;
    accountStatus?: string;
    isTestAccount?: boolean;
    verification?: BreederVerificationAdminVerificationSnapshot;
    profile?: BreederVerificationAdminProfileSnapshot;
    breeds?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface BreederVerificationAdminSearchCriteria {
    verificationStatus?: string;
    cityName?: string;
    searchKeyword?: string;
    pageNumber: number;
    itemsPerPage: number;
}

export interface BreederVerificationAdminListResultSnapshot {
    items: BreederVerificationAdminBreederSnapshot[];
    total: number;
}

export interface BreederVerificationAdminStatsSnapshot {
    totalApproved: number;
    eliteCount: number;
}

export const BREEDER_VERIFICATION_ADMIN_READER_PORT = Symbol('BREEDER_VERIFICATION_ADMIN_READER_PORT');

export interface BreederVerificationAdminReaderPort {
    findAdminById(adminId: string): Promise<BreederVerificationAdminAdminSnapshot | null>;
    getLevelChangeRequests(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot>;
    getPendingBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot>;
    getBreeders(criteria: BreederVerificationAdminSearchCriteria): Promise<BreederVerificationAdminListResultSnapshot>;
    findBreederById(breederId: string): Promise<BreederVerificationAdminBreederSnapshot | null>;
    getApprovedBreederStats(): Promise<BreederVerificationAdminStatsSnapshot>;
    findApprovedBreedersMissingDocuments(reviewedBefore: Date): Promise<BreederVerificationAdminBreederSnapshot[]>;
}
