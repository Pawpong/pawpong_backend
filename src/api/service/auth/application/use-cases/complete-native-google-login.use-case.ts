import { Inject, Injectable } from '@nestjs/common';

import {
    AUTH_NATIVE_SESSION_PORT,
    type AuthNativeSessionPort,
    type NativeAuthCallback,
} from '../ports/auth-native-session.port';
import type { AuthSocialCallbackProfile } from '../ports/auth-social-callback.port';
import type { ProcessSocialLoginCallbackFlowPort } from '../ports/auth-social-flow.port';
import { PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW } from '../tokens/auth-social-flow.token';
import {
    AuthNativeLoginPolicyService,
    NATIVE_GOOGLE_STATE_PATTERN,
} from '../../domain/services/auth-native-login-policy.service';
import { AuthSocialCallbackResultFactoryService } from '../../presentation/services/auth-social-callback-result-factory.service';

@Injectable()
export class CompleteNativeGoogleLoginUseCase {
    constructor(
        @Inject(AUTH_NATIVE_SESSION_PORT) private readonly sessions: AuthNativeSessionPort,
        @Inject(PROCESS_SOCIAL_LOGIN_CALLBACK_FLOW)
        private readonly processSocialLogin: ProcessSocialLoginCallbackFlowPort,
        private readonly policy: AuthNativeLoginPolicyService,
        private readonly resultFactory: AuthSocialCallbackResultFactoryService,
    ) {}

    /** 제공자 토큰 교환 전에 state를 검증·소비하며 취소도 같은 단발성 계약을 따른다. */
    async begin(state: string, providerError?: unknown): Promise<NativeAuthCallback> {
        const failed: NativeAuthCallback = { state, error: 'authentication_failed' };
        if (!NATIVE_GOOGLE_STATE_PATTERN.test(state)) return { state: '', error: 'authentication_failed' };
        try {
            const session = await this.sessions.consumeSession(state);
            if (!session) return failed;
            if (providerError !== undefined) {
                return { state, error: providerError === 'access_denied' ? 'cancelled' : 'authentication_failed' };
            }
            return { state, session };
        } catch {
            return failed;
        }
    }

    /** 기존 가입/로그인/복구 결과를 재사용하되 앱에는 일회용 코드만 넘긴다. */
    async execute(profile: AuthSocialCallbackProfile | undefined, callback: NativeAuthCallback): Promise<string> {
        const { state, session } = callback;
        if (callback.error || !profile || !session) {
            return this.policy.callbackUrl(state, { error: callback.error || 'authentication_failed' });
        }
        try {
            // 프로필의 originUrl은 Google이 돌려준 opaque state다. 저장된 허용 출처로 복원한다.
            const originUrl = `${session.frontendOrigin}|${session.returnUrl}`;
            const result = await this.processSocialLogin.execute(
                { ...profile, originUrl },
                session.frontendOrigin,
                session.frontendOrigin,
            );
            if (result.kind === 'error') return this.policy.callbackUrl(state, { error: 'authentication_failed' });
            // Android 로컬 origin 등 인증 시작 때 검증한 출처를 그대로 유지한다.
            const { redirectUrl } = this.resultFactory.create({ ...result, frontendUrl: session.frontendOrigin });
            this.policy.validateRedirect(redirectUrl, session.frontendOrigin);
            const code = this.policy.createCode();
            await this.sessions.saveHandoff(code, { state, codeChallenge: session.codeChallenge, redirectUrl });
            return this.policy.callbackUrl(state, { code });
        } catch {
            return this.policy.callbackUrl(state, { error: 'authentication_failed' });
        }
    }
}
