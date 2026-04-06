export interface UploadAdminStoredObjectSnapshot {
    key: string;
    size: number;
    lastModified: Date;
    url: string;
}

export interface UploadAdminStorageListSnapshot {
    files: UploadAdminStoredObjectSnapshot[];
    isTruncated: boolean;
}

export const UPLOAD_ADMIN_STORAGE = Symbol('UPLOAD_ADMIN_STORAGE');

export interface UploadAdminStoragePort {
    list(prefix?: string, maxKeys?: number): Promise<UploadAdminStorageListSnapshot>;
    delete(fileName: string): Promise<void>;
}
