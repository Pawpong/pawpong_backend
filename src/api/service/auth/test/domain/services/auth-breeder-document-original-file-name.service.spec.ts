import { AuthBreederDocumentOriginalFileNameService } from '../../../domain/services/auth-breeder-document-original-file-name.service';

describe('AuthBreederDocumentOriginalFileNameService', () => {
    const service = new AuthBreederDocumentOriginalFileNameService();

    it('빈 문자열은 그대로', () => {
        expect(service.resolve('')).toBe('');
    });

    it('한글(non-ASCII) 파일명은 그대로', () => {
        expect(service.resolve('신분증.pdf')).toBe('신분증.pdf');
    });

    it('ASCII만 있으면 decode 시도 후 동일하면 그대로', () => {
        expect(service.resolve('simple.pdf')).toBe('simple.pdf');
    });
});
