import { DomainAuthenticationError } from '../../../../../../common/error/domain.error';
import { AuthAdminAuthenticationService } from '../../../domain/services/auth-admin-authentication.service';

describe('AuthAdminAuthenticationService', () => {
    const service = new AuthAdminAuthenticationService();

    it('throwInvalidCredentials는 예외', () => {
        expect(() => service.throwInvalidCredentials()).toThrow(DomainAuthenticationError);
    });

    it('throwInvalidToken은 예외', () => {
        expect(() => service.throwInvalidToken()).toThrow(DomainAuthenticationError);
    });

    describe('assertAdminRole', () => {
        it('role=admin이면 통과', () => {
            expect(() => service.assertAdminRole({ role: 'admin' } as any)).not.toThrow();
        });
        it('다르면 예외', () => {
            expect(() => service.assertAdminRole({ role: 'adopter' } as any)).toThrow(DomainAuthenticationError);
        });
    });

    describe('toTokenPayload', () => {
        it('sub/email/role/adminLevel 필드를 구성한다', () => {
            const result = service.toTokenPayload({ adminId: 'a-1', email: 'a@b.com', adminLevel: 'super_admin' } as any);
            expect(result).toEqual({ sub: 'a-1', email: 'a@b.com', role: 'admin', adminLevel: 'super_admin' });
        });
    });
});
