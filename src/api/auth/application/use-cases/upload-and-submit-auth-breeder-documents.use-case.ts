import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { AUTH_UPLOAD_FILE_STORE_PORT, type AuthUploadFileStorePort } from '../ports/auth-upload-file-store.port';
import {
    AuthBreederDocumentSubmissionResponse,
    type SubmitAuthBreederDocumentsPort,
} from '../ports/auth-breeder-document-submission.port';
import { SUBMIT_AUTH_BREEDER_DOCUMENTS_USE_CASE } from '../tokens/auth-breeder-document-submission.token';

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

        if (!files.idCard || files.idCard.length === 0) {
            throw new BadRequestException('신분증 사본 파일이 필요합니다.');
        }

        if (!files.animalProductionLicense || files.animalProductionLicense.length === 0) {
            throw new BadRequestException('동물생산업 등록증 파일이 필요합니다.');
        }

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

        try {
            uploadedUrls.idCardUrl = (
                await this.authUploadFileStorePort.upload(files.idCard[0], 'breeder-documents')
            ).cdnUrl;
            uploadedUrls.animalProductionLicenseUrl = (
                await this.authUploadFileStorePort.upload(files.animalProductionLicense[0], 'breeder-documents')
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
        } catch (error) {
            this.logger.logError('uploadAndSubmitBreederDocuments', '파일 업로드 실패', error);
            throw new BadRequestException('파일 업로드에 실패했습니다. 다시 시도해주세요.');
        }

        return this.submitAuthBreederDocumentsUseCase.execute(userId, breederLevel, uploadedUrls);
    }
}
