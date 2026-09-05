import type { BreederPlan } from '../../../../../common/enum/user.enum';

export type BreederManagementVerificationSubmitCommand = {
    businessNumber: string;
    businessName: string;
    plan: BreederPlan;
    documents: string[];
    businessAddress: string;
    experienceYears: string;
    specialBreeds: string;
    facilityDescription: string;
    veterinaryPartnership?: string;
    submittedByEmail?: boolean;
    additionalMessage?: string;
};

export type BreederManagementVerificationDocumentInfoCommand = {
    type: string;
    fileName: string;
    originalFileName?: string;
};

export type BreederManagementVerificationDocumentsSubmitCommand = {
    documents: BreederManagementVerificationDocumentInfoCommand[];
    submittedByEmail?: boolean;
};
