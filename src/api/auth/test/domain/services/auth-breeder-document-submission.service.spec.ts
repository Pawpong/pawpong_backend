import { DomainValidationError } from '../../../../../common/error/domain.error';
import { AuthBreederDocumentSubmissionService } from '../../../domain/services/auth-breeder-document-submission.service';

describe('AuthBreederDocumentSubmissionService', () => {
    const service = new AuthBreederDocumentSubmissionService();

    describe('assertRequiredUploadFiles', () => {
        it('idCardFiles 없으면 예외', () => {
            expect(() => service.assertRequiredUploadFiles(undefined, [{} as any])).toThrow(/신분증/);
        });
        it('animalProductionLicenseFiles 없으면 예외', () => {
            expect(() => service.assertRequiredUploadFiles([{} as any], undefined)).toThrow(/동물생산업/);
        });
    });

    describe('assertRequiredDocumentUrls', () => {
        it('idCardUrl 없으면 예외', () => {
            expect(() => service.assertRequiredDocumentUrls({ idCardUrl: '', animalProductionLicenseUrl: 'a' } as any)).toThrow(DomainValidationError);
        });
    });

    describe('createStoredDocuments', () => {
        it('new 레벨은 2개만 저장', () => {
            const result = service.createStoredDocuments('new', {
                idCardUrl: 'id',
                animalProductionLicenseUrl: 'ap',
            });
            expect(result).toHaveLength(2);
            expect(result[0].type).toBe('id_card');
            expect(result[1].type).toBe('animal_production_license');
        });

        it('elite 레벨은 optional 문서가 있으면 추가', () => {
            const result = service.createStoredDocuments('elite', {
                idCardUrl: 'id',
                animalProductionLicenseUrl: 'ap',
                adoptionContractSampleUrl: 'cs',
                breederCertificationUrl: 'cert',
                ticaCfaDocumentUrl: 'tica',
            });
            expect(result).toHaveLength(5);
            expect(result.map((d) => d.type)).toContain('tica_cfa_document');
        });

        it('elite 레벨에 optional이 없으면 필수만', () => {
            const result = service.createStoredDocuments('elite', {
                idCardUrl: 'id',
                animalProductionLicenseUrl: 'ap',
            });
            expect(result).toHaveLength(2);
        });
    });

    describe('createUploadedDocuments', () => {
        it('elite 레벨은 optional 필드들을 포함 (undefined 포함)', () => {
            const result = service.createUploadedDocuments('elite', { idCardUrl: 'id', animalProductionLicenseUrl: 'ap' });
            expect(result).toHaveProperty('adoptionContractSample');
            expect(result).toHaveProperty('ticaCfaDocument');
        });
        it('new 레벨은 기본 두 개만', () => {
            const result = service.createUploadedDocuments('new', { idCardUrl: 'id', animalProductionLicenseUrl: 'ap' });
            expect(Object.keys(result)).toEqual(['idCard', 'animalProductionLicense']);
        });
    });

    describe('createResponse', () => {
        it('verificationStatus=reviewing, 처리 시간 3-5일', () => {
            const at = new Date();
            const result = service.createResponse('b-1', { idCard: 'a' }, at);
            expect(result.verificationStatus).toBe('reviewing');
            expect(result.estimatedProcessingTime).toBe('3-5일');
            expect(result.isDocumentsComplete).toBe(true);
        });
    });
});
