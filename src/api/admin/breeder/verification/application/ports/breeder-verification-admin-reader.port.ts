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

export interface BreederVerificationAdminVerificationSnapshot {
    status?: string;
    plan?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    submittedByEmail?: boolean;
    documents?: BreederVerificationAdminDocumentSnapshot[];
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
}

export const BREEDER_VERIFICATION_ADMIN_READER_PORT = Symbol('BREEDER_VERIFICATION_ADMIN_READER_PORT');

export interface BreederVerificationAdminReaderPort {
    findAdminById(adminId: string): Promise<BreederVerificationAdminAdminSnapshot | null>;
    getPendingBreeders(
        criteria: BreederVerificationAdminSearchCriteria,
    ): Promise<BreederVerificationAdminListResultSnapshot>;
    getBreeders(criteria: BreederVerificationAdminSearchCriteria): Promise<BreederVerificationAdminListResultSnapshot>;
    findBreederById(breederId: string): Promise<BreederVerificationAdminBreederSnapshot | null>;
    getApprovedBreederStats(): Promise<BreederVerificationAdminStatsSnapshot>;
    findApprovedBreedersMissingDocuments(reviewedBefore: Date): Promise<BreederVerificationAdminBreederSnapshot[]>;
}
