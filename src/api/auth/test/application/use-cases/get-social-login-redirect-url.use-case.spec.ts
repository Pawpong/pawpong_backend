import { GetSocialLoginRedirectUrlUseCase } from '../../../application/use-cases/get-social-login-redirect-url.use-case';

describe('소셜 로그인 리다이렉트 URL 생성 유스케이스', () => {
    let useCase: GetSocialLoginRedirectUrlUseCase;

    beforeEach(() => {
        useCase = new GetSocialLoginRedirectUrlUseCase();
        process.env.GOOGLE_CLIENT_ID = 'google-client-id';
        process.env.GOOGLE_CALLBACK_URL = 'https://api.example.com/auth/google/callback';
        process.env.NAVER_CLIENT_ID = 'naver-client-id';
        process.env.NAVER_CALLBACK_URL = 'https://api.example.com/auth/naver/callback';
        process.env.KAKAO_CLIENT_ID = 'kakao-client-id';
        process.env.KAKAO_CALLBACK_URL = 'https://api.example.com/auth/kakao/callback';
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

    it('returnUrl이 있으면 state에 인코딩하여 포함한다', () => {
        const url = useCase.execute('google', 'https://example.com', undefined, '/dashboard');
        expect(url).toContain('state=');
    });

    it('referer가 없으면 origin을 사용한다', () => {
        const url = useCase.execute('google', undefined, 'https://app.example.com');
        expect(url).toBeDefined();
    });
});
