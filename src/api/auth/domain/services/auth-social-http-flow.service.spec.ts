import { AuthHttpCookieService } from './auth-http-cookie.service';
import { AuthSocialHttpFlowService } from './auth-social-http-flow.service';

describe('인증 소셜 HTTP 흐름 서비스', () => {
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
        const service = new AuthSocialHttpFlowService(
            getRedirectUrlQuery,
            processSocialLoginCallbackFlow,
            authHttpCookieService,
        );

        const result = service.getRedirectUrl('google', 'https://pawpong.kr', 'https://pawpong.kr', '/feed');

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
        const res = {
            redirect: jest.fn(),
        };
        const authHttpCookieService = {
            applyCookies: jest.fn(),
        } as unknown as AuthHttpCookieService;
        const service = new AuthSocialHttpFlowService(
            getRedirectUrlQuery,
            processSocialLoginCallbackFlow,
            authHttpCookieService,
        );

        await service.handleCallback({ originUrl: 'https://pawpong.kr' } as any, res as any);

        expect(processSocialLoginCallbackFlow.execute).toHaveBeenCalledWith(
            { originUrl: 'https://pawpong.kr' },
            'https://pawpong.kr',
            'https://pawpong.kr',
        );
        expect((authHttpCookieService.applyCookies as jest.Mock)).toHaveBeenCalledWith(res, [
            { name: 'accessToken', value: 'token', options: {} },
        ]);
        expect(res.redirect).toHaveBeenCalledWith('https://pawpong.kr/login/success');
    });
});
