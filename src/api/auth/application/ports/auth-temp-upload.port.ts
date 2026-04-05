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

export abstract class AuthTempUploadPort {
    abstract get(tempId: string): AuthTempUploadInfo | undefined;
    abstract saveProfileImage(tempId: string, fileName: string): void;
    abstract saveDocuments(tempId: string, documents: AuthTempUploadDocument[]): void;
    abstract delete(tempId: string): void;
}
