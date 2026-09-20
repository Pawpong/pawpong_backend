import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';
import { AuthSocialLoginPolicyService } from '../../../domain/services/auth-social-login-policy.service';
import { AuthSocialCallbackAdapter } from '../../../infrastructure/auth-social-callback.adapter';
import { AuthSocialLoginSuccessRedirectFactoryService } from '../../../presentation/services/auth-social-login-success-redirect-factory.service';

/**
 * 소셜 로그인 쿠키 소유권 계약을 못박는다.
 *
 * **백엔드는 로그인에서 Set-Cookie 를 굽지 않는다.** 모든 환경에서 토큰을 URL 파라미터로
 * 넘기고, 쿠키는 프론트 BFF(`/api/auth/set-cookie`) 한 곳만 심는다.
 *
 * 과거 운영에서만 백엔드가 Domain=.pawpong.kr 쿠키를 굽고 /login/success 를 건너뛰었는데,
 * 그 결과 (1) 토큰 갱신 때 BFF 의 host-only 쿠키와 두 벌이 되어 양쪽이 첫 항목만 읽어
 * 옛 토큰을 집었고, (2) RN 웹뷰가 /login/success 에서만 accessToken 을 받기 때문에
 * 운영 앱 사용자의 푸시 토큰 등록이 일어나지 않았다.
 *
 * 로그아웃 만료 경로는 별개다 — 기존 사용자 브라우저에 남은 .pawpong.kr 쿠키를 지워야 하므로
 * resolveCookieOptions() 의 domain 은 계속 필요하다.
 */
describe('소셜 로그인 쿠키 소유권 계약', () => {
    const createFactory = () =>
        new AuthSocialLoginSuccessRedirectFactoryService(new AuthSocialRedirectPathService(), {
            log: jest.fn(),
        } as never);

    const tokens = { accessToken: 'test-access', refreshToken: 'test-refresh' } as never;

    it('운영에서도 Set-Cookie 를 굽지 않고 토큰을 URL 로 넘긴다', () => {
        const result = createFactory().create({
            frontendUrl: 'https://pawpong.kr',
            originUrl: 'https://pawpong.kr|/community',
            tokens,
        });

        // 쿠키는 프론트 BFF 소유 — 결과에 쿠키 개념 자체가 없다
        expect(result).not.toHaveProperty('cookies');
        expect(result.redirectUrl).toBe(
            'https://pawpong.kr/login/success?accessToken=test-access&refreshToken=test-refresh&returnUrl=%2Fcommunity',
        );
    });

    it('로컬·dev 도 동일한 경로를 탄다', () => {
        for (const frontendUrl of ['http://localhost:3000', 'https://dev.pawpong.kr']) {
            const result = createFactory().create({ frontendUrl, tokens });

            expect(result).not.toHaveProperty('cookies');
            expect(result.redirectUrl).toContain(`${frontendUrl}/login/success?accessToken=`);
        }
    });

    it('로그아웃 만료용 쿠키 옵션은 운영 도메인을 유지한다', () => {
        const configService = {
            get: jest.fn((key: string) => (key === 'NODE_ENV' ? 'production' : undefined)),
        };
        const adapter = new AuthSocialCallbackAdapter(
            {} as never,
            {} as never,
            configService as never,
            { log: jest.fn() } as never,
            {} as never,
            new AuthSocialLoginPolicyService(),
        );

        const { isProduction, cookieOptions } = adapter.resolveCookieOptions();

        // 기존 사용자 브라우저의 .pawpong.kr 쿠키를 지우려면 domain 이 정확히 같아야 한다
        expect(isProduction).toBe(true);
        expect(cookieOptions.domain).toBe('.pawpong.kr');
        expect(cookieOptions.path).toBe('/');
        expect(cookieOptions.secure).toBe(true);
        expect(cookieOptions.sameSite).toBe('none');
    });
});
