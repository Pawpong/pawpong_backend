import { BadRequestException, Injectable } from '@nestjs/common';

type AuthBreederSubmittedDocumentUrls = {
    idCardUrl: string;
    animalProductionLicenseUrl: string;
    adoptionContractSampleUrl?: string;
    recentAssociationDocumentUrl?: string;
    breederCertificationUrl?: string;
    ticaCfaDocumentUrl?: string;
};

@Injectable()
export class AuthBreederDocumentSubmissionService {
    assertRequiredDocumentUrls(documents: AuthBreederSubmittedDocumentUrls): void {
        if (!documents.idCardUrl) {
            throw new BadRequestException('신분증 사본 파일이 필요합니다.');
        }

        if (!documents.animalProductionLicenseUrl) {
            throw new BadRequestException('동물생산업 등록증 파일이 필요합니다.');
        }
    }

    createStoredDocuments(
        breederLevel: 'elite' | 'new',
        documents: AuthBreederSubmittedDocumentUrls,
    ): Array<{ type: string; url: string; uploadedAt: Date }> {
        const uploadedAt = new Date();
        const storedDocuments: Array<{ type: string; url: string; uploadedAt: Date }> = [
            {
                type: 'id_card',
                url: documents.idCardUrl,
                uploadedAt,
            },
            {
                type: 'animal_production_license',
                url: documents.animalProductionLicenseUrl,
                uploadedAt,
            },
        ];

        if (breederLevel === 'elite') {
            if (documents.adoptionContractSampleUrl) {
                storedDocuments.push({
                    type: 'adoption_contract_sample',
                    url: documents.adoptionContractSampleUrl,
                    uploadedAt,
                });
            }

            if (documents.breederCertificationUrl) {
                storedDocuments.push({
                    type: 'breeder_certification',
                    url: documents.breederCertificationUrl,
                    uploadedAt,
                });
            }

            if (documents.ticaCfaDocumentUrl) {
                storedDocuments.push({
                    type: 'tica_cfa_document',
                    url: documents.ticaCfaDocumentUrl,
                    uploadedAt,
                });
            }
        }

        return storedDocuments;
    }

    createUploadedDocuments(
        breederLevel: 'elite' | 'new',
        documents: AuthBreederSubmittedDocumentUrls,
    ): Record<string, string | undefined> {
        const uploadedDocuments: Record<string, string | undefined> = {
            idCard: documents.idCardUrl,
            animalProductionLicense: documents.animalProductionLicenseUrl,
        };

        if (breederLevel === 'elite') {
            uploadedDocuments.adoptionContractSample = documents.adoptionContractSampleUrl;
            uploadedDocuments.recentAssociationDocument = documents.recentAssociationDocumentUrl;
            uploadedDocuments.breederCertification = documents.breederCertificationUrl;
            uploadedDocuments.ticaCfaDocument = documents.ticaCfaDocumentUrl;
        }

        return uploadedDocuments;
    }

    createResponse(
        breederId: string,
        uploadedDocuments: Record<string, string | undefined>,
        submittedAt: Date,
    ): {
        breederId: string;
        verificationStatus: string;
        uploadedDocuments: Record<string, string | undefined>;
        isDocumentsComplete: boolean;
        submittedAt: Date;
        estimatedProcessingTime: string;
    } {
        return {
            breederId,
            verificationStatus: 'reviewing',
            uploadedDocuments,
            isDocumentsComplete: true,
            submittedAt,
            estimatedProcessingTime: '3-5일',
        };
    }
}
