import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import type {
    AuthSocialCallbackProfile,
    AuthSocialCallbackResult,
} from '../../application/ports/auth-social-callback.port';
import type { AuthSocialCallbackFlowResult } from '../../application/types/auth-social-callback-flow.type';
import type {
    GetSocialLoginRedirectUrlQueryPort,
    ProcessSocialLoginCallbackFlowPort,
} from '../../application/ports/auth-social-flow.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../../application/tokens/auth-social-flow.token';
import { AuthHttpCookieService } from './auth-http-cookie.service';
import { AuthSocialErrorRedirectFactoryService } from './auth-social-error-redirect-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from './auth-social-login-success-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from './auth-social-signup-redirect-factory.service';

@Injectable()
export class AuthSocialHttpFlowFacade {
    constructor(
        @Inject(GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY)
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlQueryPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackFlowPort,
        private readonly authHttpCookieService: AuthHttpCookieService,
        private readonly authSocialSignupRedirectFactoryService: AuthSocialSignupRedirectFactoryService,
        private readonly authSocialLoginSuccessRedirectFactoryService: AuthSocialLoginSuccessRedirectFactoryService,
        private readonly authSocialErrorRedirectFactoryService: AuthSocialErrorRedirectFactoryService,
    ) {}

    getRedirectUrl(
        provider: 'google' | 'naver' | 'kakao',
        referer?: string,
        origin?: string,
        returnUrl?: string,
    ): string {
        return this.getSocialLoginRedirectUrlUseCase.execute(provider, referer, origin, returnUrl);
    }

    async handleCallback(user: AuthSocialCallbackProfile, response: Response): Promise<void> {
        const originUrl = user?.originUrl || '';
        const flowResult = await this.processSocialLoginCallbackUseCase.execute(user, originUrl, originUrl);
        const result = this.buildCallbackResult(flowResult);
        this.authHttpCookieService.applyCookies(response, result.cookies);
        response.redirect(result.redirectUrl);
    }

    private buildCallbackResult(result: AuthSocialCallbackFlowResult): AuthSocialCallbackResult {
        switch (result.kind) {
            case 'signup':
                return this.authSocialSignupRedirectFactoryService.create({
                    frontendUrl: result.frontendUrl,
                    userProfile: result.userProfile,
                    tempUserId: result.tempUserId,
                });
            case 'login_success':
                return this.authSocialLoginSuccessRedirectFactoryService.create({
                    frontendUrl: result.frontendUrl,
                    originUrl: result.originUrl,
                    role: result.role,
                    tokens: result.tokens,
                    isProduction: result.isProduction,
                    cookieOptions: result.cookieOptions,
                });
            case 'error':
                return this.authSocialErrorRedirectFactoryService.create(result.frontendUrl, result.errorMessage);
        }
    }
}
