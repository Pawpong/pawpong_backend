import { Inject, Injectable } from '@nestjs/common';

import { DomainNotFoundError } from '../../../../common/error/domain.error';
import { BREEDER_MANAGEMENT_PROFILE_PORT } from '../ports/breeder-management-profile.port';
import type { BreederManagementProfilePort } from '../ports/breeder-management-profile.port';
import {
    BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT,
    type BreederManagementVerificationDocumentStorePort,
} from '../ports/breeder-management-verification-document-store.port';
import {
    BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT,
    type BreederManagementVerificationDraftDocument,
    type BreederManagementVerificationDraftStorePort,
} from '../ports/breeder-management-verification-draft-store.port';
import { BreederManagementVerificationOriginalFileNameService } from '../../domain/services/breeder-management-verification-original-file-name.service';
import { BreederManagementVerificationDocumentPolicyService } from '../../domain/services/breeder-management-verification-document-policy.service';
import type {
    BreederManagementUploadDocumentsResult,
    BreederManagementUploadedDocumentResult,
} from '../types/breeder-management-result.type';

@Injectable()
export class UploadBreederManagementVerificationDocumentsUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_PROFILE_PORT)
        private readonly breederManagementProfilePort: BreederManagementProfilePort,
        @Inject(BREEDER_MANAGEMENT_VERIFICATION_DOCUMENT_STORE_PORT)
        private readonly breederManagementVerificationDocumentStorePort: BreederManagementVerificationDocumentStorePort,
        @Inject(BREEDER_MANAGEMENT_VERIFICATION_DRAFT_STORE_PORT)
        private readonly breederManagementVerificationDraftStorePort: BreederManagementVerificationDraftStorePort,
        private readonly breederManagementVerificationOriginalFileNameService: BreederManagementVerificationOriginalFileNameService,
        private readonly breederManagementVerificationDocumentPolicyService: BreederManagementVerificationDocumentPolicyService,
    ) {}

    async execute(
        userId: string,
        files: Express.Multer.File[],
        types: string[],
        level: 'new' | 'elite',
    ): Promise<BreederManagementUploadDocumentsResult> {
        const breeder = await this.breederManagementProfilePort.findById(userId);
        if (!breeder) {
            throw new DomainNotFoundError('브리더 정보를 찾을 수 없습니다.');
        }

        this.breederManagementVerificationDocumentPolicyService.validateUploadRequest(files, types);

        const uploadedDocuments: BreederManagementUploadedDocumentResult[] = [];
        const draftDocuments: BreederManagementVerificationDraftDocument[] = [];

        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            const type = types[index];
            const originalFileName = this.breederManagementVerificationOriginalFileNameService.resolve(file.originalname);
            const uploaded = await this.breederManagementVerificationDocumentStorePort.upload(
                file,
                `verification/${userId}`,
            );

            uploadedDocuments.push({
                type,
                url: uploaded.previewUrl,
                fileName: uploaded.fileName,
                size: file.size,
                originalFileName,
            });

            draftDocuments.push({
                type,
                fileName: uploaded.fileName,
                originalFileName,
            });
        }

        await this.breederManagementVerificationDraftStorePort.save(userId, draftDocuments);

        return {
            count: uploadedDocuments.length,
            level,
            documents: uploadedDocuments,
        };
    }
}
