export type BreederManagementUploadedVerificationDocument = {
    fileName: string;
    previewUrl: string;
};

export const BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT = Symbol(
    'BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT',
);

export interface BreederManagementVerificationDocumentStorePort {
    upload(file: Express.Multer.File, folder: string): Promise<BreederManagementUploadedVerificationDocument>;
}
