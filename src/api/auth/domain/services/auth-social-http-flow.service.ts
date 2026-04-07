import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

import type { AuthSocialCallbackProfile } from '../../application/ports/auth-social-callback.port';
import { GetSocialLoginRedirectUrlUseCase } from '../../application/use-cases/get-social-login-redirect-url.use-case';
import { ProcessSocialLoginCallbackUseCase } from '../../application/use-cases/process-social-login-callback.use-case';
import { AuthHttpCookieService } from './auth-http-cookie.service';

@Injectable()
export class AuthSocialHttpFlowService {
    constructor(
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlUseCase,
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackUseCase,
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
