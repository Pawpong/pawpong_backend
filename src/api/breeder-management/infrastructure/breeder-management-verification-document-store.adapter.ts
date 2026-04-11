import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import {
    type BreederManagementVerificationDocumentStorePort,
    type BreederManagementUploadedVerificationDocument,
} from '../application/ports/breeder-management-verification-document-store.port';

@Injectable()
export class BreederManagementVerificationDocumentStoreAdapter implements BreederManagementVerificationDocumentStorePort {
    constructor(private readonly storageService: StorageService) {}

    async upload(file: Express.Multer.File, folder: string): Promise<BreederManagementUploadedVerificationDocument> {
        const uploadResult = await this.storageService.uploadFile(file, folder);

        return {
            fileName: uploadResult.fileName,
            previewUrl: this.storageService.generateSignedUrl(uploadResult.fileName, 60),
        };
    }
}
