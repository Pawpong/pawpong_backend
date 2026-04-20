import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { UploadAdminStoragePolicyService } from '../../../domain/services/upload-admin-storage-policy.service';

describe('UploadAdminStoragePolicyService', () => {
    const policy = new UploadAdminStoragePolicyService();

    describe('ensureFileName', () => {
        it('값이 있으면 통과한다', () => {
            expect(() => policy.ensureFileName('a.jpg')).not.toThrow();
        });

        it('빈 문자열이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureFileName('')).toThrow(DomainValidationError);
        });
    });

    describe('ensureFileNames', () => {
        it('배열에 값이 있으면 통과한다', () => {
            expect(() => policy.ensureFileNames(['a.jpg'])).not.toThrow();
        });

        it('빈 배열이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureFileNames([])).toThrow(DomainValidationError);
        });
    });

    describe('normalizeFolderPrefix', () => {
        it('이미 / 로 끝나면 그대로 반환한다', () => {
            expect(policy.normalizeFolderPrefix('uploads/')).toBe('uploads/');
        });

        it('/ 가 없으면 추가한다', () => {
            expect(policy.normalizeFolderPrefix('uploads')).toBe('uploads/');
        });
    });
});
