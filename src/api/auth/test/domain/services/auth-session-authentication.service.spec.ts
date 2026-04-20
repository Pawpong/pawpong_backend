import { DomainAuthenticationError } from '../../../../../common/error/domain.error';
import { AuthSessionAuthenticationService } from '../../../domain/services/auth-session-authentication.service';

describe('AuthSessionAuthenticationService', () => {
    const service = new AuthSessionAuthenticationService();

    describe('assertRefreshableRole', () => {
        it('adopter/breeder는 통과', () => {
            expect(() => service.assertRefreshableRole('adopter')).not.toThrow();
            expect(() => service.assertRefreshableRole('breeder')).not.toThrow();
        });
        it('그 외는 예외', () => {
            expect(() => service.assertRefreshableRole('admin')).toThrow(DomainAuthenticationError);
        });
    });

    it('assertUser: null이면 예외', () => {
        expect(() => service.assertUser(null)).toThrow(DomainAuthenticationError);
    });

    it('assertRefreshTokenHash: null이면 예외', () => {
        expect(() => service.assertRefreshTokenHash(null)).toThrow(DomainAuthenticationError);
    });

    it('assertRefreshTokenValid: false면 예외', () => {
        expect(() => service.assertRefreshTokenValid(false)).toThrow(DomainAuthenticationError);
    });

    it('throwExpiredRefreshToken/throwMalformedRefreshToken는 예외', () => {
        expect(() => service.throwExpiredRefreshToken()).toThrow(DomainAuthenticationError);
        expect(() => service.throwMalformedRefreshToken()).toThrow(DomainAuthenticationError);
    });
});
