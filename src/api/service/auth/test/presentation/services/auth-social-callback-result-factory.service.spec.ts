import { AuthSocialCallbackResultFactoryService } from '../../../presentation/services/auth-social-callback-result-factory.service';
import { AuthSocialErrorRedirectFactoryService } from '../../../presentation/services/auth-social-error-redirect-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../../../presentation/services/auth-social-login-success-redirect-factory.service';
import { AuthSocialReactivationRedirectFactoryService } from '../../../presentation/services/auth-social-reactivation-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from '../../../presentation/services/auth-social-signup-redirect-factory.service';
import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';
import { CustomLoggerService } from '../../../../../../common/logger/custom-logger.service';

describe('인증 소셜 콜백 결과 팩토리', () => {
    const logger = {
        log: jest.fn(),
    };

    const createFactory = () =>
        new AuthSocialCallbackResultFactoryService(
            new AuthSocialSignupRedirectFactoryService(),
            new AuthSocialLoginSuccessRedirectFactoryService(
                new AuthSocialRedirectPathService(),
                logger as unknown as CustomLoggerService,
            ),
            new AuthSocialErrorRedirectFactoryService(),
            new AuthSocialReactivationRedirectFactoryService(),
        );

    it('signup 흐름 결과를 회원가입 리다이렉트로 변환한다', () => {
        const factory = createFactory();

        const result = factory.create({
            kind: 'signup',
            frontendUrl: 'https://pawpong.kr',
            tempUserId: 'temp-id',
            userProfile: {
                provider: 'kakao',
                providerId: 'provider-id',
                email: 'new@test.com',
                name: '신규',
                needsEmail: true,
            },
        });

        expect(result.redirectUrl).toContain('https://pawpong.kr/signup?');
        expect(result.redirectUrl).toContain('tempId=temp-id');
        expect(result.redirectUrl).toContain('needsEmail=true');
    });

    it('로그인 성공 흐름 결과를 성공 리다이렉트로 변환한다', () => {
        const factory = createFactory();

        const result = factory.create({
            kind: 'login_success',
            frontendUrl: 'https://pawpong.kr',
            originUrl: 'https://pawpong.kr|/feed',
            role: 'adopter',
            tokens: {
                accessToken: 'token',
                refreshToken: 'refresh-token',
                accessTokenExpiresIn: 3600,
                refreshTokenExpiresIn: 604800,
                userInfo: {
                    userId: 'user-id',
                    email: 'user@test.com',
                    name: '유저',
                },
            },
            isProduction: false,
            cookieOptions: {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/',
            },
        });

        expect(result).toEqual({
            redirectUrl:
                'https://pawpong.kr/login/success?accessToken=token&refreshToken=refresh-token&returnUrl=%2Ffeed',
        });
    });

    it('복구 흐름 결과를 탈퇴 계정 복구 리다이렉트로 변환한다', () => {
        const factory = createFactory();

        const result = factory.create({
            kind: 'reactivation',
            frontendUrl: 'https://pawpong.kr',
            reactivationToken: 'reactivation-token',
            expiresIn: 600,
            role: 'adopter',
            email: 'deleted@test.com',
            name: '탈퇴유저',
            deletedAt: '2026-01-15T10:00:00.000Z',
        });

        expect(result.redirectUrl).toContain('https://pawpong.kr/login?');
        expect(result.redirectUrl).toContain('type=deleted_account');
        expect(result.redirectUrl).toContain('reactivationToken=reactivation-token');
        expect(result.redirectUrl).toContain('role=adopter');
        expect(result.redirectUrl).toContain('deletedAt=2026-01-15T10%3A00%3A00.000Z');
    });

    it('에러 흐름 결과를 로그인 실패 리다이렉트로 변환한다', () => {
        const factory = createFactory();

        const result = factory.create({
            kind: 'error',
            frontendUrl: 'https://pawpong.kr',
            errorMessage: '로그인 처리 중 오류가 발생했습니다.',
        });

        expect(result).toEqual({
            redirectUrl:
                'https://pawpong.kr/login?error=%EB%A1%9C%EA%B7%B8%EC%9D%B8+%EC%B2%98%EB%A6%AC+%EC%A4%91+%EC%98%A4%EB%A5%98%EA%B0%80+%EB%B0%9C%EC%83%9D%ED%96%88%EC%8A%B5%EB%8B%88%EB%8B%A4.&type=login_error',
        });
    });
});
