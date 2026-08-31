import type {
    BreederManagementApplicationFormRecord,
    BreederManagementBreederRecord,
} from './breeder-management-profile.port';

export const BREEDER_MANAGEMENT_SETTINGS_PORT = Symbol('BREEDER_MANAGEMENT_SETTINGS_PORT');

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

export interface BreederManagementLevelChangeRequestRecord {
    previousLevel: 'new' | 'elite';
    requestedLevel: 'new' | 'elite';
    requestedAt: Date;
    documents: BreederManagementStoredVerificationDocumentRecord[];
}

export interface BreederManagementSettingsPort {
    updateVerification(breederId: string, verification: BreederManagementVerificationRecord): Promise<void>;
    requestLevelChange(breederId: string, request: BreederManagementLevelChangeRequestRecord): Promise<void>;
    updateApplicationForm(
        breederId: string,
        applicationForm: BreederManagementApplicationFormRecord[],
    ): Promise<BreederManagementBreederRecord | null>;
}
