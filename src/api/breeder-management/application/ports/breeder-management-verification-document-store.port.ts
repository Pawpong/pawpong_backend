export type BreederManagementUploadedVerificationDocument = {
    fileName: string;
    previewUrl: string;
};

export abstract class BreederManagementVerificationDocumentStorePort {
    abstract upload(
        file: Express.Multer.File,
        folder: string,
    ): Promise<BreederManagementUploadedVerificationDocument>;
}
