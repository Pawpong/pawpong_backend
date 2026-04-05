import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import { AuthUploadFileStorePort, type AuthUploadedStorageFile } from '../application/ports/auth-upload-file-store.port';

@Injectable()
export class AuthUploadFileStoreAdapter extends AuthUploadFileStorePort {
    constructor(private readonly storageService: StorageService) {
        super();
    }

    async upload(file: Express.Multer.File, folder: string): Promise<AuthUploadedStorageFile> {
        const uploaded = await this.storageService.uploadFile(file, folder);
        return {
            cdnUrl: uploaded.cdnUrl,
            fileName: uploaded.fileName,
        };
    }
}
