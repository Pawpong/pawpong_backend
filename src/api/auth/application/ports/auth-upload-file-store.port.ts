export type AuthUploadedStorageFile = {
    cdnUrl: string;
    fileName: string;
};

export const AUTH_UPLOAD_FILE_STORE_PORT = Symbol('AUTH_UPLOAD_FILE_STORE_PORT');

export interface AuthUploadFileStorePort {
    upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile>;
}
