import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { AUTH_UPLOAD_FILE_STORE_PORT, type AuthUploadFileStorePort } from '../ports/auth-upload-file-store.port';
import {
    AuthBreederDocumentSubmissionResponse,
    type SubmitAuthBreederDocumentsPort,
} from '../ports/auth-breeder-document-submission.port';
import { SUBMIT_AUTH_BREEDER_DOCUMENTS_USE_CASE } from '../tokens/auth-breeder-document-submission.token';
import { AuthBreederDocumentSubmissionService } from '../../domain/services/auth-breeder-document-submission.service';

type AuthBreederDocumentFileMap = {
    idCard?: Express.Multer.File[];
    animalProductionLicense?: Express.Multer.File[];
    adoptionContractSample?: Express.Multer.File[];
    breederCertification?: Express.Multer.File[];
    ticaCfaDocument?: Express.Multer.File[];
};

@Injectable()
export class UploadAndSubmitAuthBreederDocumentsUseCase {
    constructor(
        @Inject(AUTH_UPLOAD_FILE_STORE_PORT)
        private readonly authUploadFileStorePort: AuthUploadFileStorePort,
        @Inject(SUBMIT_AUTH_BREEDER_DOCUMENTS_USE_CASE)
        private readonly submitAuthBreederDocumentsUseCase: SubmitAuthBreederDocumentsPort,
        private readonly authBreederDocumentSubmissionService: AuthBreederDocumentSubmissionService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        userId: string,
        breederLevel: 'elite' | 'new',
        files: AuthBreederDocumentFileMap,
    ): Promise<AuthBreederDocumentSubmissionResponse> {
        this.logger.logStart('uploadAndSubmitBreederDocuments', '브리더 서류 파일 업로드 시작', {
            userId,
            breederLevel,
        });

        this.authBreederDocumentSubmissionService.assertRequiredUploadFiles(
            files.idCard,
            files.animalProductionLicense,
        );
        const idCardFile = files.idCard![0];
        const animalProductionLicenseFile = files.animalProductionLicense![0];

        const uploadedUrls: {
            idCardUrl: string;
            animalProductionLicenseUrl: string;
            adoptionContractSampleUrl?: string;
            breederCertificationUrl?: string;
            ticaCfaDocumentUrl?: string;
        } = {
            idCardUrl: '',
            animalProductionLicenseUrl: '',
        };

        uploadedUrls.idCardUrl = (await this.authUploadFileStorePort.upload(idCardFile, 'breeder-documents')).cdnUrl;
        uploadedUrls.animalProductionLicenseUrl = (
            await this.authUploadFileStorePort.upload(animalProductionLicenseFile, 'breeder-documents')
        ).cdnUrl;

        if (breederLevel === 'elite') {
            if (files.adoptionContractSample?.[0]) {
                uploadedUrls.adoptionContractSampleUrl = (
                    await this.authUploadFileStorePort.upload(files.adoptionContractSample[0], 'breeder-documents')
                ).cdnUrl;
            }

            if (files.breederCertification?.[0]) {
                uploadedUrls.breederCertificationUrl = (
                    await this.authUploadFileStorePort.upload(files.breederCertification[0], 'breeder-documents')
                ).cdnUrl;
            }

            if (files.ticaCfaDocument?.[0]) {
                uploadedUrls.ticaCfaDocumentUrl = (
                    await this.authUploadFileStorePort.upload(files.ticaCfaDocument[0], 'breeder-documents')
                ).cdnUrl;
            }
        }

        this.logger.logSuccess('uploadAndSubmitBreederDocuments', '파일 업로드 완료', {
            uploadedCount: Object.values(uploadedUrls).filter(Boolean).length,
        });

        return this.submitAuthBreederDocumentsUseCase.execute(userId, breederLevel, uploadedUrls);
    }
}
