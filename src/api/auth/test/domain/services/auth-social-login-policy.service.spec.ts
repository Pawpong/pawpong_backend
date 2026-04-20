import { DomainAuthenticationError } from '../../../../../common/error/domain.error';
import { AuthSocialLoginPolicyService } from '../../../domain/services/auth-social-login-policy.service';

describe('AuthSocialLoginPolicyService', () => {
    const policy = new AuthSocialLoginPolicyService();

    it('active는 통과', () => {
        expect(() => policy.assertLoginAllowed('active')).not.toThrow();
    });

    it('deleted는 예외', () => {
        expect(() => policy.assertLoginAllowed('deleted')).toThrow(DomainAuthenticationError);
    });

    it('suspended는 예외', () => {
        expect(() => policy.assertLoginAllowed('suspended')).toThrow(DomainAuthenticationError);
    });

    it('undefined는 통과', () => {
        expect(() => policy.assertLoginAllowed(undefined)).not.toThrow();
    });
});
