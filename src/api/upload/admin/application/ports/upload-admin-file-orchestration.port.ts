import type { UploadAdminDeleteFilesResult, UploadAdminStorageListResult } from '../types/upload-admin-result.type';

export const LIST_ALL_UPLOAD_ADMIN_FILES_QUERY = Symbol('LIST_ALL_UPLOAD_ADMIN_FILES_QUERY');
export const DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND = Symbol('DELETE_MULTIPLE_UPLOAD_ADMIN_FILES_COMMAND');

export interface ListAllUploadAdminFilesQueryPort {
    execute(prefix?: string): Promise<UploadAdminStorageListResult>;
}

export interface DeleteMultipleUploadAdminFilesCommandPort {
    execute(fileNames: string[]): Promise<UploadAdminDeleteFilesResult>;
}
