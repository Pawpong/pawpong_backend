export interface UploadAdminFileReferenceSnapshot {
    collection: string;
    field: string;
    count: number;
}

export const UPLOAD_ADMIN_REFERENCE_READER_PORT = Symbol('UPLOAD_ADMIN_REFERENCE_READER_PORT');

export interface UploadAdminReferenceReaderPort {
    findReferences(fileKey: string): Promise<UploadAdminFileReferenceSnapshot[]>;
    readAllReferencedFiles(): Promise<string[]>;
}
