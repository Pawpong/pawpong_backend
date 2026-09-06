import { AuthSocialLoginSuccessRedirectFactoryService } from '../../../presentation/services/auth-social-login-success-redirect-factory.service';

describe('운영 로그인 쿠키와 프론트 계약', () => {
    it('accessToken과 역할은 웹에서 읽고 refreshToken은 HttpOnly를 유지함', () => {
        const factory = new AuthSocialLoginSuccessRedirectFactoryService(
            { resolve: () => '/' } as any,
            { log: jest.fn() } as any,
        );
        const result = factory.create({
            frontendUrl: 'https://pawpong.kr',
            role: 'adopter',
            isProduction: true,
            tokens: { accessToken: 'test-access', refreshToken: 'test-refresh' } as any,
            cookieOptions: { httpOnly: true, secure: true, sameSite: 'none', domain: '.pawpong.kr', path: '/' },
        });
        expect(result.redirectUrl).toBe('https://pawpong.kr/');
        expect(result.redirectUrl).not.toContain('test-access');
        const cookies = result.cookies!;
        expect(cookies.find((c) => c.name === 'accessToken')?.options.httpOnly).toBe(false);
        expect(cookies.find((c) => c.name === 'refreshToken')?.options.httpOnly).toBe(true);
        expect(cookies.find((c) => c.name === 'userRole')?.options.httpOnly).toBe(false);
        for (const cookie of cookies) expect(cookie.options.secure).toBe(true);
    });
});
