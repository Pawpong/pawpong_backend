import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { AuthBreederDocumentFilePolicyService } from '../../../domain/services/auth-breeder-document-file-policy.service';

function makeFile(name: string, mimetype = 'application/pdf', size = 1024): Express.Multer.File {
    return {
        fieldname: 'files',
        originalname: name,
        encoding: '7bit',
        mimetype,
        size,
        buffer: Buffer.from(''),
        destination: '',
        filename: name,
        path: '',
        stream: null as any,
    };
}

describe('AuthBreederDocumentFilePolicyService', () => {
    const policy = new AuthBreederDocumentFilePolicyService();

    it('파일 0개면 예외', () => {
        expect(() => policy.validate([], [])).toThrow(DomainValidationError);
    });

    it('지원하지 않는 type은 예외', () => {
        expect(() => policy.validate([makeFile('a.pdf')], ['invalidType'])).toThrow(/유효하지 않은 서류/);
    });

    it('중복 type은 예외', () => {
        expect(() => policy.validate([makeFile('a.pdf'), makeFile('b.pdf')], ['idCard', 'idCard'])).toThrow(/중복/);
    });

    it('파일 수와 타입 수 불일치는 예외', () => {
        expect(() => policy.validate([makeFile('a.pdf')], ['idCard', 'animalProductionLicense'])).toThrow(
            /일치하지 않습니다/,
        );
    });

    it('파일 크기 100MB 초과는 예외', () => {
        expect(() => policy.validate([makeFile('big.pdf', 'application/pdf', 101 * 1024 * 1024)], ['idCard'])).toThrow(
            /100MB/,
        );
    });

    it('지원되지 않는 확장자와 MIME이면 예외', () => {
        expect(() => policy.validate([makeFile('evil.exe', 'application/octet-stream')], ['idCard'])).toThrow(
            /지원되지 않는/,
        );
    });

    it('올바른 pdf는 통과', () => {
        expect(() => policy.validate([makeFile('doc.pdf')], ['idCard'])).not.toThrow();
    });

    it('기존 추가 서류 타입은 참고 자료로 계속 허용한다', () => {
        expect(() => policy.validate([makeFile('c.pdf')], ['ticaCfaDocument'])).not.toThrow();
    });
});
