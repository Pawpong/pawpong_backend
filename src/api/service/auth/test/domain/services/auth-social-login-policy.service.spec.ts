import { DomainAuthenticationError } from '../../../../../../common/error/domain.error';
import { AuthSocialLoginPolicyService } from '../../../domain/services/auth-social-login-policy.service';

describe('AuthSocialLoginPolicyService', () => {
    const policy = new AuthSocialLoginPolicyService();

    it('active는 로그인 허용', () => {
        expect(policy.resolveLoginDecision('active')).toBe('allow');
    });

    it('deleted는 복구 확인 단계로 보낸다', () => {
        expect(policy.resolveLoginDecision('deleted')).toBe('reactivation_required');
    });

    it('suspended는 예외', () => {
        expect(() => policy.resolveLoginDecision('suspended')).toThrow(DomainAuthenticationError);
    });

    it('undefined는 로그인 허용', () => {
        expect(policy.resolveLoginDecision(undefined)).toBe('allow');
    });
});
