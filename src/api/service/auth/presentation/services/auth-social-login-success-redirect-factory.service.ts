import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';

import {
    type AuthSocialCallbackResult,
    type AuthSocialCallbackRole,
    type AuthSocialCallbackTokens,
    type AuthSocialCookieOptions,
} from '../../application/ports/auth-social-callback.port';
import { buildAuthCookieOptions } from '../../constants/auth-cookie.constants';
import { AuthSocialRedirectPathService } from '../../domain/services/auth-social-redirect-path.service';

type LoginSuccessInput = {
    frontendUrl: string;
    originUrl?: string;
    role: AuthSocialCallbackRole;
    tokens: AuthSocialCallbackTokens;
    isProduction: boolean;
    cookieOptions: AuthSocialCookieOptions;
};

@Injectable()
export class AuthSocialLoginSuccessRedirectFactoryService {
    constructor(
        private readonly authSocialRedirectPathService: AuthSocialRedirectPathService,
        private readonly logger: CustomLoggerService,
    ) {}

    create(input: LoginSuccessInput): AuthSocialCallbackResult {
        const isLocalFrontend =
            (input.frontendUrl.includes('localhost') || input.frontendUrl.includes('127.0.0.1')) &&
            !input.frontendUrl.includes('local.pawpong.kr');
        const isVercelDev = input.frontendUrl.includes('vercel.app');
        // dev.pawpong.kr는 dev 환경이므로 RN WebView가 accessToken을 받을 수 있도록 URL 파라미터 플로우 강제
        const isDevDomain = input.frontendUrl.includes('dev.pawpong.kr');

        this.logger.log(
            `[processSocialLoginCallback] isProduction: ${input.isProduction}, isLocalFrontend: ${isLocalFrontend}, isVercelDev: ${isVercelDev}, isDevDomain: ${isDevDomain}, frontendUrl: ${input.frontendUrl}`,
        );

        if (!input.isProduction || isLocalFrontend || isVercelDev || isDevDomain) {
            this.logger.log('[processSocialLoginCallback] URL 파라미터 방식으로 토큰 전달');

            const redirectPath = this.authSocialRedirectPathService.resolve(input.originUrl, this.logger, true);

            return {
                redirectUrl: `${input.frontendUrl}/login/success?accessToken=${encodeURIComponent(input.tokens.accessToken)}&refreshToken=${encodeURIComponent(input.tokens.refreshToken)}&returnUrl=${encodeURIComponent(redirectPath)}`,
            };
        }

        // 쿠키별 httpOnly/maxAge 는 AUTH_COOKIE_POLICIES 한 곳에서 온다.
        // 로그아웃의 만료 옵션도 같은 정의를 보므로 속성이 어긋날 수 없다.
        const cookies = [
            {
                name: 'accessToken',
                value: input.tokens.accessToken,
                options: buildAuthCookieOptions('accessToken', input.cookieOptions),
            },
            {
                name: 'refreshToken',
                value: input.tokens.refreshToken,
                options: buildAuthCookieOptions('refreshToken', input.cookieOptions),
            },
            {
                name: 'userRole',
                value: input.role,
                options: buildAuthCookieOptions('userRole', input.cookieOptions),
            },
        ];

        const redirectPath = this.authSocialRedirectPathService.resolve(input.originUrl, this.logger, false);

        return {
            redirectUrl: `${input.frontendUrl}${redirectPath}`,
            cookies,
        };
    }
}
