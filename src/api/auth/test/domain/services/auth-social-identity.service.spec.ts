import { DomainValidationError } from '../../../../../common/error/domain.error';
import { AuthSocialIdentityService } from '../../../domain/services/auth-social-identity.service';

describe('AuthSocialIdentityService', () => {
    const service = new AuthSocialIdentityService();

    describe('parseRequiredTempId', () => {
        it('temp_google_12345_abc 형식을 파싱한다', () => {
            const result = service.parseRequiredTempId('temp_google_12345_abc');
            expect(result).toEqual({ provider: 'google', providerId: '12345' });
        });

        it('providerId에 _가 여러 개 있으면 join한다', () => {
            const result = service.parseRequiredTempId('temp_kakao_abc_def_ghi_end');
            expect(result.provider).toBe('kakao');
            expect(result.providerId).toBe('abc_def_ghi');
        });

        it('temp_ 시작이 아니면 예외', () => {
            expect(() => service.parseRequiredTempId('user_google_id')).toThrow(DomainValidationError);
        });

        it('파트가 4개 미만이면 예외', () => {
            expect(() => service.parseRequiredTempId('temp_google_id')).toThrow(DomainValidationError);
        });
    });

    describe('parseOptionalSocialAuthInfo', () => {
        it('tempId나 provider가 없으면 undefined', () => {
            expect(service.parseOptionalSocialAuthInfo(undefined, 'google', 'a@b.com')).toBeUndefined();
            expect(service.parseOptionalSocialAuthInfo('temp_google_1_end', undefined, 'a@b.com')).toBeUndefined();
        });
        it('둘 다 있으면 SocialAuthInfo를 반환', () => {
            const result = service.parseOptionalSocialAuthInfo('temp_google_12345_end', 'google', 'a@b.com');
            expect(result).toEqual({ authProvider: 'google', providerUserId: '12345', providerEmail: 'a@b.com' });
        });
    });
});
