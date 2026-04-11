import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { getErrorMessage } from '../../../../common/utils/error.util';

import {
    AuthSocialCallbackPort,
    type AuthSocialCallbackProfile,
    type AuthSocialCallbackResult,
} from '../ports/auth-social-callback.port';
import { AuthSocialErrorRedirectResponseFactoryService } from '../../domain/services/auth-social-error-redirect-response-factory.service';
import { AuthSocialLoginSuccessRedirectResponseFactoryService } from '../../domain/services/auth-social-login-success-redirect-response-factory.service';
import { AuthSocialSignupRedirectResponseFactoryService } from '../../domain/services/auth-social-signup-redirect-response-factory.service';

@Injectable()
export class ProcessSocialLoginCallbackUseCase {
    constructor(
        @Inject(AuthSocialCallbackPort)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
        private readonly authSocialSignupRedirectResponseFactory: AuthSocialSignupRedirectResponseFactoryService,
        private readonly authSocialLoginSuccessRedirectResponseFactory: AuthSocialLoginSuccessRedirectResponseFactoryService,
        private readonly authSocialErrorRedirectResponseFactory: AuthSocialErrorRedirectResponseFactoryService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        userProfile: AuthSocialCallbackProfile,
        referer?: string,
        origin?: string,
    ): Promise<AuthSocialCallbackResult> {
        this.logger.log(`[processSocialLoginCallback] referer: ${referer}, origin: ${origin}`);

        const frontendUrl = this.authSocialCallbackPort.resolveFrontendUrl(referer, origin);
        this.logger.log(`[processSocialLoginCallback] 결정된 frontendUrl: ${frontendUrl}`);

        try {
            const result = await this.authSocialCallbackPort.handleSocialLogin(userProfile);

            if (result.needsAdditionalInfo) {
                return this.authSocialSignupRedirectResponseFactory.create({
                    frontendUrl,
                    userProfile,
                    tempUserId: result.tempUserId || '',
                });
            }

            const user = result.user!;
            const tokens = await this.authSocialCallbackPort.generateSocialLoginTokens(user);
            const { isProduction, cookieOptions } = this.authSocialCallbackPort.resolveCookieOptions();

            return this.authSocialLoginSuccessRedirectResponseFactory.create({
                frontendUrl,
                originUrl: userProfile.originUrl,
                role: user.role,
                tokens,
                isProduction,
                cookieOptions,
                logger: this.logger,
            });
        } catch (error) {
            const errorMessage = getErrorMessage(error, '로그인 처리 중 오류가 발생했습니다.');
            this.logger.logError('processSocialLoginCallback', '소셜 로그인 콜백 처리 실패', error);

            return this.authSocialErrorRedirectResponseFactory.create(frontendUrl, errorMessage);
        }
    }
}
