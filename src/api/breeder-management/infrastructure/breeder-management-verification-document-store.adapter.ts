import { Injectable } from '@nestjs/common';

import { StorageService } from '../../../common/storage/storage.service';
import {
    BreederManagementVerificationDocumentStorePort,
    type BreederManagementUploadedVerificationDocument,
} from '../application/ports/breeder-management-verification-document-store.port';

@Injectable()
export class BreederManagementVerificationDocumentStoreAdapter extends BreederManagementVerificationDocumentStorePort {
    constructor(private readonly storageService: StorageService) {
        super();
    }

    async upload(file: Express.Multer.File, folder: string): Promise<BreederManagementUploadedVerificationDocument> {
        const uploadResult = await this.storageService.uploadFile(file, folder);

        return {
            fileName: uploadResult.fileName,
            previewUrl: this.storageService.generateSignedUrl(uploadResult.fileName, 60),
        };
    }
}
