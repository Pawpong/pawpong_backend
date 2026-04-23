import { Inject, Injectable } from '@nestjs/common';

import {
    AUTH_TEMP_UPLOAD_PORT,
    type AuthTempUploadDocument,
    type AuthTempUploadPort,
} from '../ports/auth-temp-upload.port';
import { AUTH_UPLOAD_FILE_STORE_PORT, type AuthUploadFileStorePort } from '../ports/auth-upload-file-store.port';
import { type VerificationDocumentsResult } from '../types/auth-response.type';
import { AuthBreederDocumentFilePolicyService } from '../../domain/services/auth-breeder-document-file-policy.service';
import { AuthBreederDocumentOriginalFileNameService } from '../../domain/services/auth-breeder-document-original-file-name.service';

type AuthBreederDocumentUploadResult = {
    response: VerificationDocumentsResult;
    count: number;
};

@Injectable()
export class UploadAuthBreederDocumentsUseCase {
    constructor(
        @Inject(AUTH_UPLOAD_FILE_STORE_PORT)
        private readonly authUploadFileStorePort: AuthUploadFileStorePort,
        @Inject(AUTH_TEMP_UPLOAD_PORT)
        private readonly authTempUploadPort: AuthTempUploadPort,
        private readonly authBreederDocumentFilePolicyService: AuthBreederDocumentFilePolicyService,
        private readonly authBreederDocumentOriginalFileNameService: AuthBreederDocumentOriginalFileNameService,
    ) {}

    async execute(
        files: Express.Multer.File[],
        types: string[],
        level: 'new' | 'elite',
        tempId?: string,
    ): Promise<AuthBreederDocumentUploadResult> {
        this.authBreederDocumentFilePolicyService.validate(files, types, level);

        const uploadedDocuments: Array<{
            type: string;
            url: string;
            filename: string;
            originalFileName: string;
            size: number;
            uploadedAt: Date;
        }> = [];

        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            const type = types[index];
            const uploaded = await this.authUploadFileStorePort.upload(file, `documents/verification/temp/${level}`);

            uploadedDocuments.push({
                type,
                url: uploaded.cdnUrl,
                filename: uploaded.fileName,
                originalFileName: this.authBreederDocumentOriginalFileNameService.resolve(file.originalname),
                size: file.size,
                uploadedAt: new Date(),
            });
        }

        if (tempId) {
            const tempDocuments: AuthTempUploadDocument[] = uploadedDocuments.map((document) => ({
                fileName: document.filename,
                originalFileName: document.originalFileName,
                type: document.type,
            }));
            this.authTempUploadPort.saveDocuments(tempId, tempDocuments);
        }

        return {
            response: {
                uploadedDocuments,
                allDocuments: uploadedDocuments,
            },
            count: uploadedDocuments.length,
        };
    }
}
