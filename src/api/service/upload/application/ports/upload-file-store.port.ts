export const UPLOAD_FILE_STORE_PORT = Symbol('UPLOAD_FILE_STORE_PORT');

export interface StoredUploadResource {
    readonly fileName: string;
    readonly cdnUrl: string;
    readonly storageUrl: string;
}

export interface UploadFileStorePort {
    uploadFile(file: Express.Multer.File, folder?: string): Promise<StoredUploadResource>;
    uploadFiles(files: Express.Multer.File[], folder?: string): Promise<StoredUploadResource[]>;
    deleteFile(fileName: string): Promise<void>;
    getBucketName(): string;
}
