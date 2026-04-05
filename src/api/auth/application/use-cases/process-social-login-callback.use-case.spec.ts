import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

import {
    AuthSocialCallbackPort,
    type AuthSocialAuthenticatedUser,
    type AuthSocialCallbackLoginResult,
    type AuthSocialCallbackProfile,
} from '../ports/auth-social-callback.port';
import { AuthSocialCallbackResponseFactoryService } from '../../domain/services/auth-social-callback-response-factory.service';
import { ProcessSocialLoginCallbackUseCase } from './process-social-login-callback.use-case';

class StubAuthSocialCallbackPort extends AuthSocialCallbackPort {
    profileResult: AuthSocialCallbackLoginResult = {
        needsAdditionalInfo: true,
        tempUserId: 'temp-social-id',
    };

    tokensResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresIn: 3600,
        refreshTokenExpiresIn: 604800,
        userInfo: {
            userId: 'user-id',
            email: 'user@test.com',
            name: '테스트유저',
            profileImage: '',
        },
    };

    isProduction = true;

    resolveFrontendUrl(referer?: string, origin?: string): string {
        return referer || origin || 'https://pawpong.kr';
    }

    resolveCookieOptions() {
        return {
            isProduction: this.isProduction,
            cookieOptions: {
                httpOnly: true,
                secure: this.isProduction,
                sameSite: this.isProduction ? ('none' as const) : ('lax' as const),
                domain: this.isProduction ? '.pawpong.kr' : undefined,
                path: '/',
            },
        };
    }

    async handleSocialLogin(_profile: AuthSocialCallbackProfile) {
        return this.profileResult;
    }

    async generateSocialLoginTokens(_user: AuthSocialAuthenticatedUser) {
        return this.tokensResult;
    }
}

describe('ProcessSocialLoginCallbackUseCase', () => {
    const logger = {
        log: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let port: StubAuthSocialCallbackPort;
    let useCase: ProcessSocialLoginCallbackUseCase;

    beforeEach(() => {
        port = new StubAuthSocialCallbackPort();
        useCase = new ProcessSocialLoginCallbackUseCase(
            port,
            new AuthSocialCallbackResponseFactoryService(),
            logger,
        );
    });

    it('신규 사용자는 signup redirect를 유지한다', async () => {
        const result = await useCase.execute({
            provider: 'kakao',
            providerId: 'provider-id',
            email: 'new@test.com',
            name: '신규사용자',
            profileImage: 'https://example.com/profile.jpg',
            needsEmail: true,
        });

        expect(result.cookies).toBeUndefined();
        expect(result.redirectUrl).toContain('https://pawpong.kr/signup?');
        expect(result.redirectUrl).toContain('tempId=temp-social-id');
        expect(result.redirectUrl).toContain('provider=kakao');
        expect(result.redirectUrl).toContain('needsEmail=true');
    });

    it('로컬 프론트엔드는 토큰을 URL 파라미터로 전달한다', async () => {
        port.profileResult = {
            needsAdditionalInfo: false,
            user: {
                userId: 'user-id',
                email: 'existing@test.com',
                name: '기존사용자',
                role: 'adopter',
                profileImage: '',
            },
        };
        port.isProduction = true;

        const result = await useCase.execute(
            {
                provider: 'google',
                providerId: 'provider-id',
                email: 'existing@test.com',
                name: '기존사용자',
                originUrl: 'http://localhost:3000|/mypage',
            },
            'http://localhost:3000',
            'http://localhost:3000',
        );

        expect(result.cookies).toBeUndefined();
        expect(result.redirectUrl).toBe(
            'http://localhost:3000/login/success?accessToken=access-token&refreshToken=refresh-token&returnUrl=%2Fmypage',
        );
    });

    it('프로덕션 프론트엔드는 쿠키와 redirect path 계약을 유지한다', async () => {
        port.profileResult = {
            needsAdditionalInfo: false,
            user: {
                userId: 'breeder-id',
                email: 'breeder@test.com',
                name: '브리더',
                role: 'breeder',
                profileImage: '',
            },
        };

        const result = await useCase.execute(
            {
                provider: 'naver',
                providerId: 'provider-id',
                email: 'breeder@test.com',
                name: '브리더',
                originUrl: 'https://pawpong.kr|/dashboard',
            },
            'https://pawpong.kr',
            'https://pawpong.kr',
        );

        expect(result.redirectUrl).toBe('https://pawpong.kr/dashboard');
        expect(result.cookies).toHaveLength(3);
        expect(result.cookies?.[0]).toMatchObject({
            name: 'accessToken',
            value: 'access-token',
        });
        expect(result.cookies?.[1]).toMatchObject({
            name: 'refreshToken',
            value: 'refresh-token',
        });
        expect(result.cookies?.[2]).toMatchObject({
            name: 'userRole',
            value: 'breeder',
        });
        expect(result.cookies?.[2]?.options.httpOnly).toBe(false);
    });

    it('오류 시 login redirect 계약을 유지한다', async () => {
        jest.spyOn(port, 'handleSocialLogin').mockRejectedValue(new Error('탈퇴한 계정으로는 로그인할 수 없습니다.'));

        const result = await useCase.execute(
            {
                provider: 'kakao',
                providerId: 'provider-id',
                email: 'deleted@test.com',
                name: '탈퇴사용자',
            },
            'https://pawpong.kr',
            'https://pawpong.kr',
        );

        expect(result.redirectUrl).toContain('https://pawpong.kr/login?');
        expect(result.redirectUrl).toContain('type=deleted_account');
    });
});
