import { DomainValidationError } from '../../../../../../common/error/domain.error';
import { AppVersionAdminCommandPolicyService } from '../../../domain/services/app-version-admin-command-policy.service';

describe('AppVersionAdminCommandPolicyService', () => {
    const policy = new AppVersionAdminCommandPolicyService();

    describe('ensureAdminId', () => {
        it('값이 있으면 통과한다', () => {
            expect(() => policy.ensureAdminId('admin-1')).not.toThrow();
        });

        it('빈 문자열이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureAdminId('')).toThrow(DomainValidationError);
        });
    });

    describe('ensureAppVersionId', () => {
        it('값이 있으면 통과한다', () => {
            expect(() => policy.ensureAppVersionId('v-1')).not.toThrow();
        });

        it('빈 문자열이면 DomainValidationError를 던진다', () => {
            expect(() => policy.ensureAppVersionId('')).toThrow(DomainValidationError);
        });
    });
});
