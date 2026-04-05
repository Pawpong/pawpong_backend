import { BadRequestException, Injectable } from '@nestjs/common';

import { VerificationStatus } from '../../../../common/enum/user.enum';
import type { BreederManagementVerificationDraftDocument } from '../../application/ports/breeder-management-verification-draft-store.port';
import type { BreederManagementStoredVerificationDocumentRecord } from '../../application/ports/breeder-management-settings.port';

type BreederManagementSubmittedVerificationDocument = {
    type: string;
    fileName: string;
    originalFileName?: string;
};

type BreederManagementVerificationState = {
    status?: string;
    documents?: BreederManagementStoredVerificationDocumentRecord[];
};

type BreederManagementVerificationSubmissionPlan = {
    isResubmission: boolean;
    submittedAt: Date;
    finalDocuments: BreederManagementStoredVerificationDocumentRecord[];
};

@Injectable()
export class BreederManagementVerificationDocumentPolicyService {
    validateUploadRequest(files: Express.Multer.File[], types: string[]): void {
        if (!files || files.length === 0) {
            throw new BadRequestException('업로드할 파일이 없습니다.');
        }

        if (files.length !== types.length) {
            throw new BadRequestException('파일 수와 타입 수가 일치하지 않습니다.');
        }
    }

    buildSubmissionPlan(params: {
        level: 'new' | 'elite';
        submittedDocuments: BreederManagementSubmittedVerificationDocument[];
        draftDocuments: BreederManagementVerificationDraftDocument[];
        currentVerification?: BreederManagementVerificationState;
    }): BreederManagementVerificationSubmissionPlan {
        const { level, submittedDocuments, draftDocuments, currentVerification } = params;
        const existingDocuments = currentVerification?.documents || [];
        const isResubmission =
            currentVerification?.status === VerificationStatus.REVIEWING ||
            currentVerification?.status === VerificationStatus.REJECTED;

        const submittedTypes = submittedDocuments.map((document) => document.type);
        const existingTypes = isResubmission ? existingDocuments.map((document) => document.type) : [];
        const allTypes = [...new Set([...submittedTypes, ...existingTypes])];

        this.validateRequiredDocumentTypes(level, allTypes);

        const newDocuments: BreederManagementStoredVerificationDocumentRecord[] = [];
        const typesToKeepFromExisting: string[] = [];

        for (const document of submittedDocuments) {
            if (this.isValidStoredPath(document.fileName)) {
                const draftDocument = draftDocuments.find((draft) => draft.fileName === document.fileName);
                newDocuments.push({
                    type: document.type,
                    fileName: document.fileName,
                    originalFileName: document.originalFileName || draftDocument?.originalFileName,
                    uploadedAt: new Date(),
                });
                continue;
            }

            typesToKeepFromExisting.push(document.type);
        }

        const mergedExistingDocuments = !isResubmission
            ? []
            : existingDocuments.filter((existingDocument) => {
                  const isBeingReplaced = newDocuments.some(
                      (newDocument) => newDocument.type === existingDocument.type,
                  );
                  const shouldKeep = typesToKeepFromExisting.includes(existingDocument.type);
                  return !isBeingReplaced && shouldKeep && this.isValidStoredPath(existingDocument.fileName);
              });

        const finalDocuments = [...mergedExistingDocuments, ...newDocuments];

        this.validateRequiredDocumentTypes(
            level,
            finalDocuments.map((document) => document.type),
        );

        return {
            isResubmission,
            submittedAt: new Date(),
            finalDocuments,
        };
    }

    private validateRequiredDocumentTypes(level: 'new' | 'elite', documentTypes: string[]): void {
        const requiredTypes =
            level === 'new' ? ['idCard', 'businessLicense'] : ['idCard', 'businessLicense', 'contractSample'];
        const missingTypes = requiredTypes.filter((type) => !documentTypes.includes(type));

        if (missingTypes.length > 0) {
            throw new BadRequestException(`필수 서류가 누락되었습니다: ${missingTypes.join(', ')}`);
        }

        if (level === 'elite') {
            const hasBreederCertificate =
                documentTypes.includes('breederCatCertificate') ||
                documentTypes.includes('breederDogCertificate');

            if (!hasBreederCertificate) {
                throw new BadRequestException('Elite 레벨은 브리더 인증 서류가 필수입니다.');
            }
        }
    }

    private isValidStoredPath(fileName?: string): boolean {
        return !!fileName && fileName.startsWith('verification/');
    }
}
