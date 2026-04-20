import { BreederManagementVerificationOriginalFileNameService } from '../../../domain/services/breeder-management-verification-original-file-name.service';

describe('BreederManagementVerificationOriginalFileNameService', () => {
    const service = new BreederManagementVerificationOriginalFileNameService();

    it('비어있으면 그대로 반환', () => {
        expect(service.resolve('')).toBe('');
    });

    it('non-ASCII 문자가 포함되어 있으면 그대로 반환', () => {
        expect(service.resolve('한글파일.pdf')).toBe('한글파일.pdf');
    });

    it('ASCII만 있고 latin1->utf8 디코드시 동일하면 그대로 반환', () => {
        expect(service.resolve('simple.pdf')).toBe('simple.pdf');
    });
});
