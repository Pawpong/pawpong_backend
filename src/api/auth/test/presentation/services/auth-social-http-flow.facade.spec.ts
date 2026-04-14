import { AuthSocialHttpFlowFacade } from '../../../presentation/services/auth-social-http-flow.facade';
import { AuthHttpCookieService } from '../../../presentation/services/auth-http-cookie.service';
import { AuthSocialErrorRedirectFactoryService } from '../../../presentation/services/auth-social-error-redirect-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../../../presentation/services/auth-social-login-success-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from '../../../presentation/services/auth-social-signup-redirect-factory.service';
import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';

describe('인증 소셜 HTTP 흐름 파사드', () => {
    it('리다이렉트 주소 조회를 포트에 위임한다', () => {
        const getRedirectUrlQuery = {
            execute: jest.fn().mockReturnValue('https://accounts.example.com/oauth'),
        };
        const processSocialLoginCallbackFlow = {
            execute: jest.fn(),
        };
        const authHttpCookieService = {
            applyCookies: jest.fn(),
        } as unknown as AuthHttpCookieService;
        const facade = new AuthSocialHttpFlowFacade(
            getRedirectUrlQuery,
            processSocialLoginCallbackFlow,
            authHttpCookieService,
            new AuthSocialSignupRedirectFactoryService(),
            {
                create: jest.fn(),
            } as unknown as AuthSocialLoginSuccessRedirectFactoryService,
            new AuthSocialErrorRedirectFactoryService(),
        );

        const result = facade.getRedirectUrl('google', 'https://pawpong.kr', 'https://pawpong.kr', '/feed');

        expect(getRedirectUrlQuery.execute).toHaveBeenCalledWith(
            'google',
            'https://pawpong.kr',
            'https://pawpong.kr',
            '/feed',
        );
        expect(result).toBe('https://accounts.example.com/oauth');
    });

    it('콜백 처리 결과로 쿠키를 적용하고 리다이렉트한다', async () => {
        const getRedirectUrlQuery = {
            execute: jest.fn(),
        };
        const processSocialLoginCallbackFlow = {
            execute: jest.fn().mockResolvedValue({
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
            }),
        };
        const response = {
            redirect: jest.fn(),
        };
        const logger = {
            log: jest.fn(),
        };
        const authHttpCookieService = {
            applyCookies: jest.fn(),
        } as unknown as AuthHttpCookieService;
        const facade = new AuthSocialHttpFlowFacade(
            getRedirectUrlQuery,
            processSocialLoginCallbackFlow,
            authHttpCookieService,
            new AuthSocialSignupRedirectFactoryService(),
            new AuthSocialLoginSuccessRedirectFactoryService(
                new AuthSocialRedirectPathService(),
                logger as any,
            ),
            new AuthSocialErrorRedirectFactoryService(),
        );

        await facade.handleCallback({ originUrl: 'https://pawpong.kr' } as any, response as any);

        expect(processSocialLoginCallbackFlow.execute).toHaveBeenCalledWith(
            { originUrl: 'https://pawpong.kr' },
            'https://pawpong.kr',
            'https://pawpong.kr',
        );
        expect((authHttpCookieService.applyCookies as jest.Mock)).toHaveBeenCalledWith(response, undefined);
        expect(response.redirect).toHaveBeenCalledWith(
            'https://pawpong.kr/login/success?accessToken=token&refreshToken=refresh-token&returnUrl=%2Ffeed',
        );
    });

    it('signup 흐름 결과를 회원가입 리다이렉트로 변환한다', async () => {
        const facade = new AuthSocialHttpFlowFacade(
            { execute: jest.fn() },
            {
                execute: jest.fn().mockResolvedValue({
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
                }),
            },
            {
                applyCookies: jest.fn(),
            } as unknown as AuthHttpCookieService,
            new AuthSocialSignupRedirectFactoryService(),
            {
                create: jest.fn(),
            } as unknown as AuthSocialLoginSuccessRedirectFactoryService,
            new AuthSocialErrorRedirectFactoryService(),
        );
        const response = { redirect: jest.fn() };

        await facade.handleCallback({ originUrl: 'https://pawpong.kr' } as any, response as any);

        expect(response.redirect).toHaveBeenCalledWith(
            expect.stringContaining('https://pawpong.kr/signup?'),
        );
    });
});
