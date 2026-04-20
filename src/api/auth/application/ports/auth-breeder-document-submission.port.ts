export type AuthBreederDocumentUrls = {
    idCardUrl: string;
    animalProductionLicenseUrl: string;
    adoptionContractSampleUrl?: string;
    recentAssociationDocumentUrl?: string;
    breederCertificationUrl?: string;
    ticaCfaDocumentUrl?: string;
};

export type AuthBreederDocumentSubmissionResponse = {
    breederId: string;
    verificationStatus: string;
    uploadedDocuments: Record<string, string | undefined>;
    isDocumentsComplete: boolean;
    submittedAt: Date;
    estimatedProcessingTime: string;
};

export interface SubmitAuthBreederDocumentsPort {
    execute(
        userId: string,
        breederLevel: 'elite' | 'new',
        documents: AuthBreederDocumentUrls,
    ): Promise<AuthBreederDocumentSubmissionResponse>;
}
