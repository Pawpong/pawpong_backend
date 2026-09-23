import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AUTH_NATIVE_SESSION_PORT, type AuthNativeSessionPort } from '../ports/auth-native-session.port';
import {
    AuthNativeLoginPolicyService,
    NATIVE_AUTH_CODE_PATTERN,
} from '../../domain/services/auth-native-login-policy.service';

@Injectable()
export class StartNativeGoogleLoginUseCase {
    constructor(
        @Inject(AUTH_NATIVE_SESSION_PORT) private readonly sessions: AuthNativeSessionPort,
        private readonly policy: AuthNativeLoginPolicyService,
    ) {}

    /** 서버 state를 앱의 PKCE challenge와 묶고 시스템 브라우저용 인증 주소를 발급한다. */
    async execute(input: { codeChallenge: string; frontendOrigin: string; returnUrl?: string }) {
        if (
            !NATIVE_AUTH_CODE_PATTERN.test(input.codeChallenge) ||
            Buffer.from(input.codeChallenge, 'base64url').toString('base64url') !== input.codeChallenge
        ) {
            throw new BadRequestException('잘못된 인증 요청입니다.');
        }
        const session = {
            codeChallenge: input.codeChallenge,
            frontendOrigin: this.policy.normalizeOrigin(input.frontendOrigin),
            returnUrl: this.policy.normalizeReturnUrl(input.returnUrl),
        };
        const state = this.policy.createState();
        const authorizationUrl = this.policy.authorizationUrl(state);
        await this.sessions.saveSession(state, session);
        return { authorizationUrl, state };
    }
}
