import { AuthSocialHttpFlowFacade } from '../../../presentation/services/auth-social-http-flow.facade';
import { AuthHttpCookieService } from '../../../presentation/services/auth-http-cookie.service';

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
                redirectUrl: 'https://pawpong.kr/login/success',
                cookies: [{ name: 'accessToken', value: 'token', options: {} }],
            }),
        };
        const response = {
            redirect: jest.fn(),
        };
        const authHttpCookieService = {
            applyCookies: jest.fn(),
        } as unknown as AuthHttpCookieService;
        const facade = new AuthSocialHttpFlowFacade(
            getRedirectUrlQuery,
            processSocialLoginCallbackFlow,
            authHttpCookieService,
        );

        await facade.handleCallback({ originUrl: 'https://pawpong.kr' } as any, response as any);

        expect(processSocialLoginCallbackFlow.execute).toHaveBeenCalledWith(
            { originUrl: 'https://pawpong.kr' },
            'https://pawpong.kr',
            'https://pawpong.kr',
        );
        expect((authHttpCookieService.applyCookies as jest.Mock)).toHaveBeenCalledWith(response, [
            { name: 'accessToken', value: 'token', options: {} },
        ]);
        expect(response.redirect).toHaveBeenCalledWith('https://pawpong.kr/login/success');
    });
});
