export type AuthTempUploadDocument = {
    fileName: string;
    originalFileName?: string;
    type: string;
};

export type AuthTempUploadInfo = {
    profileImage?: string;
    documents?: AuthTempUploadDocument[];
    createdAt: Date;
};

export const AUTH_TEMP_UPLOAD_PORT = Symbol('AUTH_TEMP_UPLOAD_PORT');

export interface AuthTempUploadPort {
    get(tempId: string): AuthTempUploadInfo | undefined;
    saveProfileImage(tempId: string, fileName: string): void;
    saveDocuments(tempId: string, documents: AuthTempUploadDocument[]): void;
    delete(tempId: string): void;
}
