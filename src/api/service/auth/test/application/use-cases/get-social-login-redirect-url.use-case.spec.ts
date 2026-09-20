import { GetSocialLoginRedirectUrlUseCase } from '../../../application/use-cases/get-social-login-redirect-url.use-case';
import { AuthSocialRedirectPathService } from '../../../domain/services/auth-social-redirect-path.service';

describe('소셜 로그인 리다이렉트 URL 생성 유스케이스', () => {
    let useCase: GetSocialLoginRedirectUrlUseCase;

    beforeEach(() => {
        useCase = new GetSocialLoginRedirectUrlUseCase(new AuthSocialRedirectPathService());
        process.env.GOOGLE_CLIENT_ID = 'google-client-id';
        process.env.GOOGLE_CALLBACK_URL = 'https://api.example.com/auth/google/callback';
        process.env.NAVER_CLIENT_ID = 'naver-client-id';
        process.env.NAVER_CALLBACK_URL = 'https://api.example.com/auth/naver/callback';
        process.env.KAKAO_CLIENT_ID = 'kakao-client-id';
        process.env.KAKAO_CALLBACK_URL = 'https://api.example.com/auth/kakao/callback';
        process.env.APPLE_CLIENT_ID = 'kr.pawpong.web';
        process.env.APPLE_CALLBACK_URL = 'https://api.example.com/auth/apple/callback';
    });

    it('google 프로바이더에 대한 리다이렉트 URL을 반환한다', () => {
        const url = useCase.execute('google');
        expect(url).toContain('accounts.google.com');
        expect(url).toContain('google-client-id');
    });

    it('naver 프로바이더에 대한 리다이렉트 URL을 반환한다', () => {
        const url = useCase.execute('naver');
        expect(url).toContain('nid.naver.com');
        expect(url).toContain('naver-client-id');
    });

    it('kakao 프로바이더에 대한 리다이렉트 URL을 반환한다', () => {
        const url = useCase.execute('kakao');
        expect(url).toContain('kauth.kakao.com');
        expect(url).toContain('kakao-client-id');
    });

    it('apple 프로바이더에 대한 리다이렉트 URL을 반환한다', () => {
        const url = useCase.execute('apple');
        expect(url).toContain('appleid.apple.com/auth/authorize');
        expect(url).toContain('kr.pawpong.web');
    });

    it('apple은 name/email scope 요청에 필요한 form_post 응답 모드를 지정한다', () => {
        // scope에 name/email이 있으면 Apple이 form_post를 강제한다. 빠지면 인증 자체가 거부된다.
        const params = new URL(useCase.execute('apple')).searchParams;
        expect(params.get('response_mode')).toBe('form_post');
        expect(params.get('scope')).toBe('name email');
        expect(params.get('response_type')).toBe('code id_token');
    });

    it('returnUrl이 있으면 state에 인코딩하여 포함한다', () => {
        const url = useCase.execute('google', 'https://example.com', undefined, '/dashboard');
        expect(new URL(url).searchParams.get('state')).toBe('https://example.com|/dashboard');
    });

    it('외부 returnUrl은 OAuth state에서 제외한다', () => {
        const url = useCase.execute('google', 'https://example.com', undefined, 'https://evil.example');
        expect(new URL(url).searchParams.get('state')).toBe('https://example.com');
    });

    it('referer가 없으면 origin을 사용한다', () => {
        const url = useCase.execute('google', undefined, 'https://app.example.com');
        expect(url).toBeDefined();
    });
});
