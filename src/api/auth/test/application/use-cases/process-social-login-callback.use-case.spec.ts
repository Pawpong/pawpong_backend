import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

import {
    type AuthSocialCallbackPort,
    type AuthSocialAuthenticatedUser,
    type AuthSocialCallbackLoginResult,
    type AuthSocialCallbackProfile,
} from '../../../application/ports/auth-social-callback.port';
import { ProcessSocialLoginCallbackUseCase } from '../../../application/use-cases/process-social-login-callback.use-case';

class StubAuthSocialCallbackPort implements AuthSocialCallbackPort {
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

describe('소셜 로그인 콜백 처리 유스케이스', () => {
    const logger = {
        log: jest.fn(),
        logError: jest.fn(),
    } as unknown as CustomLoggerService;

    let port: StubAuthSocialCallbackPort;
    let useCase: ProcessSocialLoginCallbackUseCase;

    beforeEach(() => {
        port = new StubAuthSocialCallbackPort();
        useCase = new ProcessSocialLoginCallbackUseCase(port, logger);
    });

    it('신규 사용자는 signup 흐름 결과를 반환한다', async () => {
        const result = await useCase.execute({
            provider: 'kakao',
            providerId: 'provider-id',
            email: 'new@test.com',
            name: '신규사용자',
            profileImage: 'https://example.com/profile.jpg',
            needsEmail: true,
        });

        expect(result).toMatchObject({
            kind: 'signup',
            frontendUrl: 'https://pawpong.kr',
            tempUserId: 'temp-social-id',
        });
        expect(result.kind).toBe('signup');
        if (result.kind === 'signup') {
            expect(result.userProfile.provider).toBe('kakao');
            expect(result.userProfile.needsEmail).toBe(true);
        }
    });

    it('기존 사용자는 login 성공 흐름 결과를 반환한다', async () => {
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

        expect(result).toMatchObject({
            kind: 'login_success',
            frontendUrl: 'http://localhost:3000',
            originUrl: 'http://localhost:3000|/mypage',
            role: 'adopter',
            isProduction: true,
        });
        if (result.kind === 'login_success') {
            expect(result.tokens.accessToken).toBe('access-token');
            expect(result.cookieOptions.sameSite).toBe('none');
        }
    });

    it('프로덕션 브리더 로그인은 쿠키 옵션이 포함된 흐름 결과를 반환한다', async () => {
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

        expect(result).toMatchObject({
            kind: 'login_success',
            frontendUrl: 'https://pawpong.kr',
            originUrl: 'https://pawpong.kr|/dashboard',
            role: 'breeder',
            isProduction: true,
        });
        if (result.kind === 'login_success') {
            expect(result.tokens.refreshToken).toBe('refresh-token');
            expect(result.cookieOptions.domain).toBe('.pawpong.kr');
        }
    });

    it('오류 시 error 흐름 결과를 반환한다', async () => {
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

        expect(result).toEqual({
            kind: 'error',
            frontendUrl: 'https://pawpong.kr',
            errorMessage: '탈퇴한 계정으로는 로그인할 수 없습니다.',
        });
    });
});
