export type AuthUploadedStorageFile = {
    cdnUrl: string;
    fileName: string;
};

export abstract class AuthUploadFileStorePort {
    abstract upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile>;
}
