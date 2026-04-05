import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { UploadFileStorePort } from '../application/ports/upload-file-store.port';

@Injectable()
export class UploadStorageAdapter implements UploadFileStorePort {
    constructor(private readonly storageService: StorageService) {}

    uploadFile(file: Express.Multer.File, folder?: string) {
        return this.storageService.uploadFile(file, folder);
    }

    uploadFiles(files: Express.Multer.File[], folder?: string) {
        return this.storageService.uploadMultipleFiles(files, folder);
    }

    deleteFile(fileName: string) {
        return this.storageService.deleteFile(fileName);
    }

    getBucketName(): string {
        return this.storageService.getBucketName();
    }
}
