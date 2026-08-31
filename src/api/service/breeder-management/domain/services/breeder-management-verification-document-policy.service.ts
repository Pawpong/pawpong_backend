import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../../common/error/domain.error';
import { VerificationStatus } from '../../../../../common/enum/user.enum';
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

const DOCUMENT_TYPE_ALIASES: Record<string, string> = {
    idCard: 'id_card',
    id_card: 'id_card',
    animalProductionLicense: 'animal_production_license',
    businessLicense: 'animal_production_license',
    animal_production_license: 'animal_production_license',
    adoptionContractSample: 'adoption_contract_sample',
    contractSample: 'adoption_contract_sample',
    adoption_contract_sample: 'adoption_contract_sample',
    recentAssociationDocument: 'recent_pedigree_document',
    recent_association_document: 'recent_pedigree_document',
    recentPedigreeDocument: 'recent_pedigree_document',
    pedigreeDocument: 'recent_pedigree_document',
    pedigree: 'recent_pedigree_document',
    recent_pedigree_document: 'recent_pedigree_document',
    breederCertification: 'breeder_certification',
    breederCertificate: 'breeder_certification',
    breederDogCertificate: 'breeder_certification',
    breederCatCertificate: 'breeder_certification',
    ticaCfaDocument: 'breeder_certification',
    tica_cfa_document: 'breeder_certification',
    breeder_certification: 'breeder_certification',
};

const REQUIRED_NEW_DOCUMENT_TYPES = ['id_card', 'animal_production_license'] as const;
const REQUIRED_ELITE_DOCUMENT_TYPES = [...REQUIRED_NEW_DOCUMENT_TYPES, 'adoption_contract_sample'] as const;
const ELITE_PROFESSIONAL_DOCUMENT_TYPES = ['recent_pedigree_document', 'breeder_certification'] as const;

@Injectable()
export class BreederManagementVerificationDocumentPolicyService {
    validateUploadRequest(files: Express.Multer.File[], types: string[]): void {
        if (!files || files.length === 0) {
            throw new DomainValidationError('업로드할 파일이 없습니다.');
        }

        if (files.length !== types.length) {
            throw new DomainValidationError('파일 수와 타입 수가 일치하지 않습니다.');
        }
    }

    buildSubmissionPlan(params: {
        level: 'new' | 'elite';
        submittedDocuments: BreederManagementSubmittedVerificationDocument[];
        draftDocuments: BreederManagementVerificationDraftDocument[];
        currentVerification?: BreederManagementVerificationState;
    }): BreederManagementVerificationSubmissionPlan {
        const { level, submittedDocuments, draftDocuments, currentVerification } = params;
        const existingDocuments = (currentVerification?.documents || [])
            .filter((document) => this.isValidStoredPath(document.fileName))
            .map((document) => ({
                ...document,
                type: this.normalizeDocumentType(document.type),
            }));
        const isResubmission =
            currentVerification?.status === VerificationStatus.REVIEWING ||
            currentVerification?.status === VerificationStatus.REJECTED;

        const documentsByType = new Map(existingDocuments.map((document) => [document.type, document] as const));

        for (const document of submittedDocuments) {
            const normalizedType = this.normalizeDocumentType(document.type);
            this.assertSupportedDocumentType(document.type, normalizedType);

            if (this.isValidStoredPath(document.fileName)) {
                const draftDocument = draftDocuments.find((draft) => draft.fileName === document.fileName);
                documentsByType.set(normalizedType, {
                    type: normalizedType,
                    fileName: document.fileName,
                    originalFileName: document.originalFileName || draftDocument?.originalFileName,
                    uploadedAt: new Date(),
                });
            }
        }

        const finalDocuments = [...documentsByType.values()];

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

    normalizeDocumentType(type: string): string {
        return DOCUMENT_TYPE_ALIASES[type] || type;
    }

    private validateRequiredDocumentTypes(level: 'new' | 'elite', documentTypes: string[]): void {
        const normalizedTypes = new Set(documentTypes.map((type) => this.normalizeDocumentType(type)));
        const requiredTypes = level === 'new' ? REQUIRED_NEW_DOCUMENT_TYPES : REQUIRED_ELITE_DOCUMENT_TYPES;
        const missingTypes = requiredTypes.filter((type) => !normalizedTypes.has(type));

        if (missingTypes.length > 0) {
            throw new DomainValidationError(`필수 서류가 누락되었습니다: ${missingTypes.join(', ')}`);
        }

        if (level === 'elite') {
            const hasProfessionalDocument = ELITE_PROFESSIONAL_DOCUMENT_TYPES.some((type) => normalizedTypes.has(type));

            if (!hasProfessionalDocument) {
                throw new DomainValidationError('Elite 레벨은 전문성을 증빙하는 서류가 1개 이상 필요합니다.');
            }
        }
    }

    private assertSupportedDocumentType(inputType: string, normalizedType: string): void {
        if (!Object.values(DOCUMENT_TYPE_ALIASES).includes(normalizedType)) {
            throw new DomainValidationError(`지원하지 않는 서류 타입입니다: ${inputType}`);
        }
    }

    private isValidStoredPath(fileName?: string): boolean {
        return (
            !!fileName &&
            (fileName.startsWith('verification/') ||
                fileName.startsWith('documents/verification/') ||
                fileName.startsWith('breeder-documents/'))
        );
    }
}
