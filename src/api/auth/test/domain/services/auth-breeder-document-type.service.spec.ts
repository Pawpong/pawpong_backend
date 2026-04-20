import { AuthBreederDocumentTypeService } from '../../../domain/services/auth-breeder-document-type.service';

describe('AuthBreederDocumentTypeService', () => {
    const service = new AuthBreederDocumentTypeService();

    describe('toPersistedType', () => {
        it('매핑된 값은 변환된다', () => {
            expect(service.toPersistedType('idCard')).toBe('id_card');
            expect(service.toPersistedType('animalProductionLicense')).toBe('animal_production_license');
            expect(service.toPersistedType('pedigree')).toBe('recent_pedigree_document');
        });

        it('매핑되지 않은 값은 그대로 반환', () => {
            expect(service.toPersistedType('unknown')).toBe('unknown');
        });
    });

    describe('extractFromUrl', () => {
        it('id_card 또는 신분증이 포함되면 id_card', () => {
            expect(service.extractFromUrl('/docs/id_card_001.jpg')).toBe('id_card');
            expect(service.extractFromUrl('/docs/신분증.jpg')).toBe('id_card');
        });

        it('동물생산업 관련 → animal_production_license', () => {
            expect(service.extractFromUrl('/docs/동물생산업-license.pdf')).toBe('animal_production_license');
        });

        it('입양계약서 → adoption_contract_sample', () => {
            expect(service.extractFromUrl('/입양계약서.pdf')).toBe('adoption_contract_sample');
        });

        it('혈통서 → pedigree', () => {
            expect(service.extractFromUrl('/pedigree.pdf')).toBe('pedigree');
        });

        it('브리더인증/TICA/CFA → breeder_certification', () => {
            expect(service.extractFromUrl('/TICA-cert.pdf')).toBe('breeder_certification');
            expect(service.extractFromUrl('/브리더인증.pdf')).toBe('breeder_certification');
        });

        it('매칭 안 되면 other', () => {
            expect(service.extractFromUrl('/random.pdf')).toBe('other');
        });
    });
});
