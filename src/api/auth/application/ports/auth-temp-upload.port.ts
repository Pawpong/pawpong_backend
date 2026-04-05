export const AUTH_TEMP_UPLOAD_PORT = Symbol('AUTH_TEMP_UPLOAD_PORT');

export interface AuthTempUploadDocument {
    fileName: string;
    originalFileName?: string;
    type: string;
}

export interface AuthTempUploadInfo {
    profileImage?: string;
    documents?: AuthTempUploadDocument[];
    createdAt: Date;
}

export interface AuthTempUploadPort {
    get(tempId: string): AuthTempUploadInfo | undefined;
    saveProfileImage(tempId: string, fileName: string): void;
    saveDocuments(tempId: string, documents: AuthTempUploadDocument[]): void;
    delete(tempId: string): void;
}
