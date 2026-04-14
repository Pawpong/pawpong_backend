import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import { getErrorMessage } from '../../../../common/utils/error.util';

import {
    AUTH_SOCIAL_CALLBACK_PORT,
    type AuthSocialCallbackPort,
    type AuthSocialCallbackProfile,
} from '../ports/auth-social-callback.port';
import type { AuthSocialCallbackFlowResult } from '../types/auth-social-callback-flow.type';

@Injectable()
export class ProcessSocialLoginCallbackUseCase {
    constructor(
        @Inject(AUTH_SOCIAL_CALLBACK_PORT)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(
        userProfile: AuthSocialCallbackProfile,
        referer?: string,
        origin?: string,
    ): Promise<AuthSocialCallbackFlowResult> {
        this.logger.log(`[processSocialLoginCallback] referer: ${referer}, origin: ${origin}`);

        const frontendUrl = this.authSocialCallbackPort.resolveFrontendUrl(referer, origin);
        this.logger.log(`[processSocialLoginCallback] 결정된 frontendUrl: ${frontendUrl}`);

        try {
            const result = await this.authSocialCallbackPort.handleSocialLogin(userProfile);

            if (result.needsAdditionalInfo) {
                return {
                    kind: 'signup',
                    frontendUrl,
                    tempUserId: result.tempUserId || '',
                    userProfile,
                };
            }

            const user = result.user!;
            const tokens = await this.authSocialCallbackPort.generateSocialLoginTokens(user);
            const { isProduction, cookieOptions } = this.authSocialCallbackPort.resolveCookieOptions();

            return {
                kind: 'login_success',
                frontendUrl,
                originUrl: userProfile.originUrl,
                role: user.role,
                tokens,
                isProduction,
                cookieOptions,
            };
        } catch (error) {
            const errorMessage = getErrorMessage(error, '로그인 처리 중 오류가 발생했습니다.');
            this.logger.logError('processSocialLoginCallback', '소셜 로그인 콜백 처리 실패', error);

            return {
                kind: 'error',
                frontendUrl,
                errorMessage,
            };
        }
    }
}
