export type UploadAdminStorageFileResult = {
    key: string;
    size: number;
    lastModified: Date;
    url: string;
    folder: string;
};

export type UploadAdminStorageListResult = {
    files: UploadAdminStorageFileResult[];
    totalFiles: number;
    folderStats: Record<string, { count: number; totalSize: number }>;
    isTruncated: boolean;
};

export type UploadAdminDeleteFilesResult = {
    deletedCount: number;
    failedFiles: string[];
};

export type UploadAdminFileReferenceLocationResult = {
    collection: string;
    field: string;
    count: number;
};

export type UploadAdminFileReferenceItemResult = {
    fileKey: string;
    isReferenced: boolean;
    references: UploadAdminFileReferenceLocationResult[];
};

export type UploadAdminFileReferenceResult = {
    files: UploadAdminFileReferenceItemResult[];
    referencedCount: number;
    orphanedCount: number;
};
