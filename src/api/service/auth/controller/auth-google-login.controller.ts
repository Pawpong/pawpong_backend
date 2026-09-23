import { Get, Headers, Inject, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGoogleCallbackGuard, type GoogleCallbackRequest } from '../presentation/guards/auth-google-callback.guard';
import { CompleteNativeGoogleLoginUseCase } from '../application/use-cases/complete-native-google-login.use-case';
import type {
    GetSocialLoginRedirectUrlQueryPort,
    ProcessSocialLoginCallbackFlowPort,
} from '../application/ports/auth-social-flow.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../application/tokens/auth-social-flow.token';
import { AuthSocialOAuthController } from '../decorator/auth-public-controller.decorator';
import { AuthRedirectResponseInterceptor } from '../presentation/interceptors/auth-redirect-response.interceptor';
import { AuthGoogleCallbackResponseInterceptor } from '../presentation/interceptors/auth-google-callback-response.interceptor';
import { ApiGoogleCallbackEndpoint, ApiGoogleLoginEndpoint } from '../swagger/index';

@AuthSocialOAuthController()
export class AuthGoogleLoginController {
    constructor(
        @Inject(GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY)
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlQueryPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackFlowPort,
        private readonly completeNativeLogin: CompleteNativeGoogleLoginUseCase,
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
    @UseGuards(AuthGoogleCallbackGuard)
    @UseInterceptors(AuthGoogleCallbackResponseInterceptor)
    @ApiGoogleCallbackEndpoint()
    async googleCallback(@Req() req: GoogleCallbackRequest) {
        if (req.nativeOAuth) return this.completeNativeLogin.execute(req.user, req.nativeOAuth);
        const originUrl = req.user?.originUrl || '';
        return this.processSocialLoginCallbackUseCase.execute(req.user!, originUrl, originUrl);
    }
}
