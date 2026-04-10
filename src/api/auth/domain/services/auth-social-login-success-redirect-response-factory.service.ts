import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

import {
    type AuthSocialCallbackResult,
    type AuthSocialCallbackRole,
    type AuthSocialCallbackTokens,
    type AuthSocialCookieOptions,
} from '../../application/ports/auth-social-callback.port';
import { AuthSocialRedirectPathService } from './auth-social-redirect-path.service';

type LoginSuccessInput = {
    frontendUrl: string;
    originUrl?: string;
    role: AuthSocialCallbackRole;
    tokens: AuthSocialCallbackTokens;
    isProduction: boolean;
    cookieOptions: AuthSocialCookieOptions;
    logger: CustomLoggerService;
};

@Injectable()
export class AuthSocialLoginSuccessRedirectResponseFactoryService {
    constructor(private readonly authSocialRedirectPathService: AuthSocialRedirectPathService) {}

    create(input: LoginSuccessInput): AuthSocialCallbackResult {
        const isLocalFrontend =
            (input.frontendUrl.includes('localhost') || input.frontendUrl.includes('127.0.0.1')) &&
            !input.frontendUrl.includes('local.pawpong.kr');
        const isVercelDev = input.frontendUrl.includes('vercel.app');

        input.logger.log(
            `[processSocialLoginCallback] isProduction: ${input.isProduction}, isLocalFrontend: ${isLocalFrontend}, isVercelDev: ${isVercelDev}, frontendUrl: ${input.frontendUrl}`,
        );

        if (!input.isProduction || isLocalFrontend || isVercelDev) {
            input.logger.log('[processSocialLoginCallback] URL 파라미터 방식으로 토큰 전달');

            const redirectPath = this.authSocialRedirectPathService.resolve(input.originUrl, input.logger, true);

            return {
                redirectUrl: `${input.frontendUrl}/login/success?accessToken=${encodeURIComponent(input.tokens.accessToken)}&refreshToken=${encodeURIComponent(input.tokens.refreshToken)}&returnUrl=${encodeURIComponent(redirectPath)}`,
            };
        }

        const cookies = [
            {
                name: 'accessToken',
                value: input.tokens.accessToken,
                options: {
                    ...input.cookieOptions,
                    maxAge: 24 * 60 * 60 * 1000,
                },
            },
            {
                name: 'refreshToken',
                value: input.tokens.refreshToken,
                options: {
                    ...input.cookieOptions,
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                },
            },
            {
                name: 'userRole',
                value: input.role,
                options: {
                    ...input.cookieOptions,
                    httpOnly: false,
                    maxAge: 24 * 60 * 60 * 1000,
                },
            },
        ];

        const redirectPath = this.authSocialRedirectPathService.resolve(input.originUrl, input.logger, false);

        return {
            redirectUrl: `${input.frontendUrl}${redirectPath}`,
            cookies,
        };
    }
}
