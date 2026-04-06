export interface UploadAdminFileReferenceSnapshot {
    collection: string;
    field: string;
    count: number;
}

export const UPLOAD_ADMIN_REFERENCE_READER = Symbol('UPLOAD_ADMIN_REFERENCE_READER');

export interface UploadAdminReferenceReaderPort {
    findReferences(fileKey: string): Promise<UploadAdminFileReferenceSnapshot[]>;
    readAllReferencedFiles(): Promise<string[]>;
}
