export type BreederManagementVerificationSubmitCommand = {
    businessNumber: string;
    businessName: string;
    plan: 'basic' | 'premium' | 'enterprise';
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
    level: 'new' | 'elite';
    documents: BreederManagementVerificationDocumentInfoCommand[];
    submittedByEmail?: boolean;
};
