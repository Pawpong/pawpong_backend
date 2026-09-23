import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { AUTH_NATIVE_SESSION_PORT, type AuthNativeSessionPort } from '../ports/auth-native-session.port';
import {
    AuthNativeLoginPolicyService,
    NATIVE_AUTH_CODE_PATTERN,
    NATIVE_GOOGLE_STATE_PATTERN,
} from '../../domain/services/auth-native-login-policy.service';

@Injectable()
export class ExchangeNativeLoginUseCase {
    constructor(
        @Inject(AUTH_NATIVE_SESSION_PORT) private readonly sessions: AuthNativeSessionPort,
        private readonly policy: AuthNativeLoginPolicyService,
    ) {}

    /** code와 state만 가로챈 외부 앱은 원래 앱의 verifier 없이는 로그인할 수 없다. */
    async execute(input: { code: string; state: string; codeVerifier: string }): Promise<{ redirectUrl: string }> {
        if (!NATIVE_AUTH_CODE_PATTERN.test(input.code) || !NATIVE_GOOGLE_STATE_PATTERN.test(input.state)) {
            throw new UnauthorizedException('앱 인증이 만료되었거나 올바르지 않습니다.');
        }
        const challenge = this.policy.challengeFor(input.codeVerifier);
        const result = await this.sessions.consumeHandoff(input.code, input.state, challenge);
        if (!result) throw new UnauthorizedException('앱 인증이 만료되었거나 올바르지 않습니다.');
        return { redirectUrl: result.redirectUrl };
    }
}
