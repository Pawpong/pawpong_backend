import { Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';

import {
    type AuthSocialCallbackProfile,
    type AuthSocialCallbackResult,
    type AuthSocialCallbackRole,
    type AuthSocialCallbackTokens,
    type AuthSocialCookieOptions,
} from '../../application/ports/auth-social-callback.port';

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
export class AuthSocialCallbackResponseFactoryService {
    createSignupRedirect(input: {
        frontendUrl: string;
        userProfile: AuthSocialCallbackProfile;
        tempUserId: string;
    }): AuthSocialCallbackResult {
        const params: Record<string, string> = {
            tempId: input.tempUserId,
            provider: input.userProfile.provider || '',
            email: input.userProfile.email || '',
            name: input.userProfile.name || '',
            profileImage: input.userProfile.profileImage || '',
        };

        if (input.userProfile.needsEmail) {
            params.needsEmail = 'true';
        }

        return {
            redirectUrl: `${input.frontendUrl}/signup?${new URLSearchParams(params).toString()}`,
        };
    }

    createLoginSuccessRedirect(input: LoginSuccessInput): AuthSocialCallbackResult {
        const isLocalFrontend =
            (input.frontendUrl.includes('localhost') || input.frontendUrl.includes('127.0.0.1')) &&
            !input.frontendUrl.includes('local.pawpong.kr');
        const isVercelDev = input.frontendUrl.includes('vercel.app');

        input.logger.log(
            `[processSocialLoginCallback] isProduction: ${input.isProduction}, isLocalFrontend: ${isLocalFrontend}, isVercelDev: ${isVercelDev}, frontendUrl: ${input.frontendUrl}`,
        );

        if (!input.isProduction || isLocalFrontend || isVercelDev) {
            input.logger.log('[processSocialLoginCallback] URL 파라미터 방식으로 토큰 전달');

            const redirectPath = this.extractRedirectPath(input.originUrl, input.logger, true);

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

        const redirectPath = this.extractRedirectPath(input.originUrl, input.logger, false);

        return {
            redirectUrl: `${input.frontendUrl}${redirectPath}`,
            cookies,
        };
    }

    createErrorRedirect(frontendUrl: string, errorMessage: string): AuthSocialCallbackResult {
        const errorParams = new URLSearchParams({
            error: errorMessage,
            type: errorMessage.includes('탈퇴')
                ? 'deleted_account'
                : errorMessage.includes('정지')
                  ? 'suspended_account'
                  : 'login_error',
        });

        return {
            redirectUrl: `${frontendUrl}/login?${errorParams.toString()}`,
        };
    }

    private extractRedirectPath(originUrl: string | undefined, logger: CustomLoggerService, isLocalLog: boolean): string {
        let redirectPath = '/explore';

        if (originUrl && originUrl.includes('|')) {
            const parts = originUrl.split('|');
            if (parts.length > 1 && parts[1]) {
                redirectPath = parts[1];
                logger.log(
                    isLocalLog
                        ? `[processSocialLoginCallback] 추출된 redirectPath (localhost): ${redirectPath}`
                        : `[processSocialLoginCallback] 추출된 redirectPath: ${redirectPath}`,
                );
            }
        }

        return redirectPath;
    }
}
