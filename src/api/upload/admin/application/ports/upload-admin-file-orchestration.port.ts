import type { UploadAdminDeleteFilesResult, UploadAdminStorageListResult } from '../types/upload-admin-result.type';

export interface ListAllUploadAdminFilesQueryPort {
    execute(prefix?: string): Promise<UploadAdminStorageListResult>;
}

export interface DeleteMultipleUploadAdminFilesCommandPort {
    execute(fileNames: string[]): Promise<UploadAdminDeleteFilesResult>;
}
