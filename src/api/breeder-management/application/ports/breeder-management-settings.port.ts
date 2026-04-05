import type {
    BreederManagementApplicationFormRecord,
    BreederManagementBreederRecord,
} from './breeder-management-profile.port';

export const BREEDER_MANAGEMENT_SETTINGS_PORT = 'BREEDER_MANAGEMENT_SETTINGS_PORT';

export interface BreederManagementStoredVerificationDocumentRecord {
    type: string;
    fileName: string;
    originalFileName?: string;
    uploadedAt?: Date;
}

export interface BreederManagementVerificationRecord {
    status: string;
    plan?: string;
    level?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    documents: BreederManagementStoredVerificationDocumentRecord[];
    submittedByEmail?: boolean;
}

export interface BreederManagementSettingsPort {
    updateVerification(breederId: string, verification: BreederManagementVerificationRecord): Promise<void>;
    updateApplicationForm(
        breederId: string,
        applicationForm: BreederManagementApplicationFormRecord[],
    ): Promise<BreederManagementBreederRecord | null>;
}
