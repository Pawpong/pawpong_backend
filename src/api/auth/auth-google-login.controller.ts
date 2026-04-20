import { Get, Headers, Inject, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import type { AuthSocialCallbackProfile } from './application/ports/auth-social-callback.port';
import type {
    GetSocialLoginRedirectUrlQueryPort,
    ProcessSocialLoginCallbackFlowPort,
} from './application/ports/auth-social-flow.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from './application/tokens/auth-social-flow.token';
import { AuthPublicController } from './decorator/auth-public-controller.decorator';
import { AuthRedirectResponseInterceptor } from './presentation/interceptors/auth-redirect-response.interceptor';
import { AuthSocialCallbackResponseInterceptor } from './presentation/interceptors/auth-social-callback-response.interceptor';
import { ApiGoogleCallbackEndpoint, ApiGoogleLoginEndpoint } from './swagger';

@AuthPublicController()
export class AuthGoogleLoginController {
    constructor(
        @Inject(GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY)
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlQueryPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackFlowPort,
    ) {}

    @Get('google')
    @UseInterceptors(AuthRedirectResponseInterceptor)
    @ApiGoogleLoginEndpoint()
    googleLogin(
        @Headers('referer') referer?: string,
        @Headers('origin') origin?: string,
        @Query('returnUrl') returnUrl?: string,
    ): string {
        return this.getSocialLoginRedirectUrlUseCase.execute('google', referer, origin, returnUrl);
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @UseInterceptors(AuthSocialCallbackResponseInterceptor)
    @ApiGoogleCallbackEndpoint()
    async googleCallback(@Req() req: Request & { user: AuthSocialCallbackProfile }) {
        const originUrl = req.user?.originUrl || '';
        return this.processSocialLoginCallbackUseCase.execute(req.user, originUrl, originUrl);
    }
}
