import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

import type { NativeAuthCallback } from '../../application/ports/auth-native-session.port';
import type { AuthSocialCallbackProfile } from '../../application/ports/auth-social-callback.port';
import { CompleteNativeGoogleLoginUseCase } from '../../application/use-cases/complete-native-google-login.use-case';
import { NATIVE_GOOGLE_STATE_PREFIX } from '../../domain/services/auth-native-login-policy.service';

export type GoogleCallbackRequest = Request & { user?: AuthSocialCallbackProfile; nativeOAuth?: NativeAuthCallback };

/** Google 취소·실패도 앱 인증 창을 닫을 수 있게 고정 앱 콜백으로 반환한다. */
@Injectable()
export class AuthGoogleCallbackGuard extends AuthGuard('google') {
    constructor(private readonly nativeLogin: CompleteNativeGoogleLoginUseCase) {
        super();
    }

    /** 기존 웹 로그인은 Passport의 기존 동작을 유지한다. */
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<GoogleCallbackRequest>();
        const state = request.query.state;
        if (typeof state !== 'string' || !state.startsWith(NATIVE_GOOGLE_STATE_PREFIX)) {
            return (await super.canActivate(context)) as boolean;
        }
        // Guard가 만든 값만 controller에 전달한다. 유효하지 않은 state는 Passport에 보내지 않는다.
        request.nativeOAuth = await this.nativeLogin.begin(state, request.query.error);
        if (request.nativeOAuth.error) return true;
        try {
            // code가 없으면 Passport가 인증을 다시 시작하므로 명시적으로 실패 처리한다.
            if (typeof request.query.code !== 'string' || !request.query.code) {
                request.nativeOAuth.error = 'authentication_failed';
                return true;
            }
            return (await super.canActivate(context)) as boolean;
        } catch {
            request.nativeOAuth.error = 'authentication_failed';
            return true;
        }
    }
}
