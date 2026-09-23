import { Body, Get, Headers, HttpCode, HttpStatus, Inject, Post, Query, UseInterceptors } from '@nestjs/common';

import { CustomLoggerService } from '../../../../common/logger/custom-logger.service';
import type {
    AppleCallbackBody,
    AppleCallbackUser,
    AppleIdTokenClaims,
} from '../../../../common/types/social-oauth.type';
import type { AuthSocialCallbackProfile } from '../application/ports/auth-social-callback.port';
import type {
    GetSocialLoginRedirectUrlQueryPort,
    ProcessSocialLoginCallbackFlowPort,
} from '../application/ports/auth-social-flow.port';
import {
    GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY,
    PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW,
} from '../application/tokens/auth-social-flow.token';
import { AuthSocialOAuthController } from '../decorator/auth-public-controller.decorator';
import { AuthAppleIdTokenService } from '../domain/services/auth-apple-id-token.service';
import { AppleCredentialService } from '../apple-credentials/application/apple-credential.service';
import { AuthRedirectResponseInterceptor } from '../presentation/interceptors/auth-redirect-response.interceptor';
import { AuthSocialCallbackResponseInterceptor } from '../presentation/interceptors/auth-social-callback-response.interceptor';
import { ApiAppleCallbackEndpoint, ApiAppleLoginEndpoint } from '../swagger/index';

/**
 * Apple 로그인 (Sign in with Apple).
 *
 * App Store 심사 가이드라인 4.8 은 제3자 소셜 로그인만 제공하는 앱에 Apple 로그인 제공을 의무화한다.
 *
 * 구글/카카오/네이버와 두 가지가 다르다:
 * 1. **콜백이 POST** — name/email scope 를 요청하면 Apple 이 response_mode=form_post 를 강제한다.
 *    그래서 passport 전략 대신 직접 본문을 받아 처리한다.
 * 2. **이름·이메일이 최초 인증 1회만 온다** — 두 번째 로그인부터는 id_token 의 sub 만 신뢰할 수 있다.
 *    첫 응답의 `user` 필드를 놓치면 이름을 영영 못 받으므로 여기서 바로 프로필에 실어 보낸다.
 */
@AuthSocialOAuthController()
export class AuthAppleLoginController {
    constructor(
        @Inject(GET_SOCIAL_LOGIN_REDIRECT_URL_QUERY)
        private readonly getSocialLoginRedirectUrlUseCase: GetSocialLoginRedirectUrlQueryPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLoginCallbackUseCase: ProcessSocialLoginCallbackFlowPort,
        private readonly appleIdTokenService: AuthAppleIdTokenService,
        private readonly appleCredentials: AppleCredentialService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Get('apple')
    @UseInterceptors(AuthRedirectResponseInterceptor)
    @ApiAppleLoginEndpoint()
    appleLogin(
        @Headers('referer') referer?: string,
        @Headers('origin') origin?: string,
        @Query('returnUrl') returnUrl?: string,
    ): string {
        return this.getSocialLoginRedirectUrlUseCase.execute('apple', referer, origin, returnUrl);
    }

    @Post('apple/callback')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(AuthSocialCallbackResponseInterceptor)
    @ApiAppleCallbackEndpoint()
    async appleCallback(@Body() body: AppleCallbackBody) {
        // 사용자가 Apple 인증 화면에서 취소하면 error 만 담겨 돌아온다.
        if (body.error) {
            this.logger.log('[appleLogin] Apple 인증 취소 또는 실패');
        }

        const claims = await this.appleIdTokenService.verify(body.id_token || '');
        const formUser = this.parseUser(body.user);

        // state 에는 다른 제공사와 동일하게 originUrl 이 들어 있다.
        const originUrl = this.decodeState(body.state);

        const profile: AuthSocialCallbackProfile = {
            provider: 'apple',
            providerId: claims.sub,
            email: this.appleIdTokenService.resolveEmail(claims, formUser?.email),
            name: this.resolveName(formUser, claims),
            originUrl,
        };

        // 영구 삭제 등으로 로그인 자체가 거절된 계정의 새 외부 토큰은 저장하지 않는다.
        const result = await this.processSocialLoginCallbackUseCase.execute(profile, originUrl, originUrl);
        if (result.kind === 'error') return result;
        await this.appleCredentials.capture(body.code, claims.sub);
        return result;
    }

    /** 최초 인증에만 오는 `user` JSON. 깨져 있어도 로그인 자체를 막지 않는다. */
    private parseUser(raw?: string): AppleCallbackUser | null {
        if (!raw) return null;
        try {
            return JSON.parse(raw) as AppleCallbackUser;
        } catch {
            this.logger.log('[appleLogin] user 필드 파싱 실패 — 이름 없이 진행함');
            return null;
        }
    }

    private decodeState(state?: string): string {
        if (!state) return '';
        try {
            return decodeURIComponent(state);
        } catch {
            return '';
        }
    }

    /**
     * 이름은 최초 1회뿐이라 없으면 이메일 앞부분으로 대체한다.
     * 재로그인 때 빈 이름으로 덮어쓰지 않도록, 이 값은 신규 가입 시에만 쓰인다.
     */
    private resolveName(formUser: AppleCallbackUser | null, claims: AppleIdTokenClaims): string {
        const composed = [formUser?.name?.lastName, formUser?.name?.firstName].filter(Boolean).join('');
        if (composed) return composed;

        const email = claims.email || formUser?.email;
        return email ? email.split('@')[0] : `apple_${claims.sub.slice(0, 8)}`;
    }
}
