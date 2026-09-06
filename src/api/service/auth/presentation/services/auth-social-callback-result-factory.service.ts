import { Injectable } from '@nestjs/common';

import type { AuthSocialCallbackResult } from '../../application/ports/auth-social-callback.port';
import type { AuthSocialCallbackFlowResult } from '../../application/types/auth-social-callback-flow.type';
import { AuthSocialErrorRedirectFactoryService } from './auth-social-error-redirect-factory.service';
import { AuthSocialLoginSuccessRedirectFactoryService } from './auth-social-login-success-redirect-factory.service';
import { AuthSocialReactivationRedirectFactoryService } from './auth-social-reactivation-redirect-factory.service';
import { AuthSocialSignupRedirectFactoryService } from './auth-social-signup-redirect-factory.service';

@Injectable()
export class AuthSocialCallbackResultFactoryService {
    constructor(
        private readonly authSocialSignupRedirectFactoryService: AuthSocialSignupRedirectFactoryService,
        private readonly authSocialLoginSuccessRedirectFactoryService: AuthSocialLoginSuccessRedirectFactoryService,
        private readonly authSocialErrorRedirectFactoryService: AuthSocialErrorRedirectFactoryService,
        private readonly authSocialReactivationRedirectFactoryService: AuthSocialReactivationRedirectFactoryService,
    ) {}

    create(result: AuthSocialCallbackFlowResult): AuthSocialCallbackResult {
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
            case 'reactivation':
                return this.authSocialReactivationRedirectFactoryService.create({
                    frontendUrl: result.frontendUrl,
                    originUrl: result.originUrl,
                    reactivationToken: result.reactivationToken,
                    expiresIn: result.expiresIn,
                    role: result.role,
                    email: result.email,
                    name: result.name,
                    deletedAt: result.deletedAt,
                });
            case 'error':
                return this.authSocialErrorRedirectFactoryService.create(result.frontendUrl, result.errorMessage);
        }
    }
}
