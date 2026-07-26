import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthBreederDocumentTypeService {
    private readonly persistedTypeByInput: Record<string, string> = {
        idCard: 'id_card',
        animalProductionLicense: 'animal_production_license',
        adoptionContractSample: 'adoption_contract_sample',
        recentAssociationDocument: 'recent_pedigree_document',
        pedigree: 'recent_pedigree_document',
        breederCertification: 'breeder_certification',
    };

    toPersistedType(type: string): string {
        return this.persistedTypeByInput[type] || type;
    }

    extractFromUrl(url: string): string {
        const fileName = url.split('/').pop() || '';
        const lowerFileName = fileName.toLowerCase();

        if (lowerFileName.includes('id_card') || lowerFileName.includes('신분증')) {
            return 'id_card';
        }

        if (lowerFileName.includes('animal_production') || lowerFileName.includes('동물생산업')) {
            return 'animal_production_license';
        }

        if (lowerFileName.includes('adoption_contract') || lowerFileName.includes('입양계약서')) {
            return 'adoption_contract_sample';
        }

        if (lowerFileName.includes('pedigree') || lowerFileName.includes('혈통서')) {
            return 'pedigree';
        }

        if (
            lowerFileName.includes('breeder_certification') ||
            lowerFileName.includes('브리더인증') ||
            lowerFileName.includes('tica') ||
            lowerFileName.includes('cfa')
        ) {
            return 'breeder_certification';
        }

        return 'other';
    }
}
