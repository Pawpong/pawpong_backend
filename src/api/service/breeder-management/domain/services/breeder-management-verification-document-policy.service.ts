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
const MAX_DOCUMENT_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_DOCUMENT_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_DOCUMENT_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

@Injectable()
export class BreederManagementVerificationDocumentPolicyService {
    validateUploadRequest(files: Express.Multer.File[], types: string[], level: 'new' | 'elite'): void {
        if (!files || files.length === 0) {
            throw new DomainValidationError('업로드할 파일이 없습니다.');
        }

        if (files.length !== types.length) {
            throw new DomainValidationError('파일 수와 타입 수가 일치하지 않습니다.');
        }

        const normalizedTypes = types.map((type) => {
            const normalizedType = this.normalizeDocumentType(type);
            this.assertSupportedDocumentType(type, normalizedType);
            return normalizedType;
        });

        if (new Set(normalizedTypes).size !== normalizedTypes.length) {
            throw new DomainValidationError('중복된 서류 타입이 있습니다. 각 서류는 한 번만 업로드해야 합니다.');
        }

        const allowedTypes =
            level === 'new'
                ? new Set<string>(REQUIRED_NEW_DOCUMENT_TYPES)
                : new Set<string>([...REQUIRED_ELITE_DOCUMENT_TYPES, ...ELITE_PROFESSIONAL_DOCUMENT_TYPES]);
        const invalidType = normalizedTypes.find((type) => !allowedTypes.has(type));
        if (invalidType) {
            throw new DomainValidationError(`${level} 등급에서 제출할 수 없는 서류 타입입니다: ${invalidType}`);
        }

        for (const file of files) {
            if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
                throw new DomainValidationError(`파일 "${file.originalname}"의 크기는 20MB를 초과할 수 없습니다.`);
            }

            const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
            if (!ALLOWED_DOCUMENT_MIME_TYPES.has(file.mimetype) || !ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
                throw new DomainValidationError(
                    `파일 "${file.originalname}"은(는) 지원되지 않는 형식입니다. (지원: PDF, JPG, PNG, WEBP)`,
                );
            }
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

            const existingDocument = existingDocuments.find(
                (existing) => existing.type === normalizedType && existing.fileName === document.fileName,
            );
            if (existingDocument) {
                documentsByType.set(normalizedType, existingDocument);
                continue;
            }

            if (document.fileName === 'keep-existing') {
                if (!documentsByType.has(normalizedType)) {
                    throw new DomainValidationError(`유지할 기존 서류가 없습니다: ${document.type}`);
                }
                continue;
            }

            if (!this.isValidStoredPath(document.fileName)) {
                throw new DomainValidationError(`유효하지 않은 서류 파일 경로입니다: ${document.type}`);
            }

            const draftDocument = draftDocuments.find(
                (draft) =>
                    draft.fileName === document.fileName && this.normalizeDocumentType(draft.type) === normalizedType,
            );
            if (!draftDocument) {
                throw new DomainValidationError(`업로드가 확인되지 않은 서류입니다: ${document.type}`);
            }

            documentsByType.set(normalizedType, {
                type: normalizedType,
                fileName: document.fileName,
                originalFileName: document.originalFileName || draftDocument.originalFileName,
                uploadedAt: new Date(),
            });
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
