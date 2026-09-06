import { AuthHttpCookieService } from '../../../presentation/services/auth-http-cookie.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../../../presentation/services/auth-social-login-success-redirect-factory.service';

describe('로그아웃 쿠키 만료 — 로그인 시 속성과 일치해야 한다', () => {
    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        domain: '.pawpong.kr',
        path: '/',
    };

    function setup() {
        const response = { cookie: jest.fn() } as any;
        const port = { resolveCookieOptions: () => ({ isProduction: true, cookieOptions }) } as any;
        return { service: new AuthHttpCookieService(port), response };
    }

    const clearedOptions = (response: any, name: string) =>
        response.cookie.mock.calls.find((call: unknown[]) => call[0] === name)?.[2];

    it('accessToken 은 HttpOnly 없이 만료시킨다 (JS 가 읽고 지울 수 있어야 한다)', () => {
        const { service, response } = setup();

        service.clearAuthCookies(response);

        expect(clearedOptions(response, 'accessToken').httpOnly).toBe(false);
    });

    it('refreshToken 은 HttpOnly 를 유지한 채 만료시킨다', () => {
        const { service, response } = setup();

        service.clearAuthCookies(response);

        expect(clearedOptions(response, 'refreshToken').httpOnly).toBe(true);
    });

    it('userRole 은 HttpOnly 없이 만료시킨다', () => {
        const { service, response } = setup();

        service.clearAuthCookies(response);

        expect(clearedOptions(response, 'userRole').httpOnly).toBe(false);
    });

    it('모든 인증 쿠키를 maxAge 0 으로, 같은 domain/path 로 만료시킨다', () => {
        const { service, response } = setup();

        service.clearAuthCookies(response);

        const names = response.cookie.mock.calls.map((call: unknown[]) => call[0]);
        expect(names).toEqual(['accessToken', 'refreshToken', 'userRole']);
        for (const call of response.cookie.mock.calls) {
            expect(call[1]).toBe('');
            expect(call[2].maxAge).toBe(0);
            expect(call[2].domain).toBe('.pawpong.kr');
            expect(call[2].path).toBe('/');
        }
    });

    it('로그인 시 굽는 httpOnly 와 로그아웃 시 만료 httpOnly 가 쿠키별로 정확히 일치한다', () => {
        const { service, response } = setup();
        const factory = new AuthSocialLoginSuccessRedirectFactoryService(
            { resolve: () => '/' } as any,
            { log: jest.fn() } as any,
        );

        const baked = factory.create({
            frontendUrl: 'https://pawpong.kr',
            role: 'adopter',
            isProduction: true,
            tokens: { accessToken: 'a', refreshToken: 'r' } as any,
            cookieOptions,
        }).cookies!;
        service.clearAuthCookies(response);

        // 이 대조가 깨지면 로그아웃이 쿠키를 지우지 못하고 속성만 덮어쓴다.
        for (const cookie of baked) {
            expect(clearedOptions(response, cookie.name).httpOnly).toBe(cookie.options.httpOnly);
        }
        expect(baked.map((cookie) => cookie.name)).toEqual(['accessToken', 'refreshToken', 'userRole']);
    });
});
