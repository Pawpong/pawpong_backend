import { Inject, Injectable } from '@nestjs/common';
import type { Response } from 'express';

import type { AuthSocialCallbackProfile } from '../../application/ports/auth-social-callback.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
    type GetSocialLoginRedirectUrlQueryPort,
    type ProcessSocialLoginCallbackFlowPort,
} from '../../application/ports/auth-social-flow.port';
import { AuthHttpCookieService } from './auth-http-cookie.service';

@Injectable()
export class AuthSocialHttpFlowService {
    constructor(
        @Inject(GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY)
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlQueryPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackFlowPort,
        private readonly authHttpCookieService: AuthHttpCookieService,
    ) {}

    getRedirectUrl(
        provider: 'google' | 'naver' | 'kakao',
        referer?: string,
        origin?: string,
        returnUrl?: string,
    ): string {
        return this.getSocialLoginRedirectUrlUseCase.execute(provider, referer, origin, returnUrl);
    }

    async handleCallback(user: AuthSocialCallbackProfile, res: Response): Promise<void> {
        const originUrl = user?.originUrl || '';
        const result = await this.processSocialLoginCallbackUseCase.execute(user, originUrl, originUrl);
        this.authHttpCookieService.applyCookies(res, result.cookies);
        res.redirect(result.redirectUrl);
    }
}
