import { Inject, Injectable } from '@nestjs/common';

import { hasErrorName } from '../../../../../common/utils/error.util';

import {
    AUTH_ACCOUNT_REACTIVATION_PORT,
    type AuthAccountReactivationPort,
} from '../ports/auth-account-reactivation.port';
import { AUTH_SOCIAL_CALLBACK_PORT, type AuthSocialCallbackPort } from '../ports/auth-social-callback.port';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../ports/auth-token.port';
import type { AuthAccountReactivationResult } from '../types/auth-account-reactivation.type';
import { AuthAccountReactivationPolicyService } from '../../domain/services/auth-account-reactivation-policy.service';

/**
 * 탈퇴 계정을 사용자의 동의를 받아 되살린다.
 *
 * 소셜 콜백에서 발급한 단기 복구 토큰이 있어야만 호출할 수 있으므로,
 * 임의의 userId 로 남의 계정을 복구할 수는 없다.
 */
@Injectable()
export class ReactivateAccountUseCase {
    constructor(
        @Inject(AUTH_TOKEN_PORT)
        private readonly authTokenPort: AuthTokenPort,
        @Inject(AUTH_ACCOUNT_REACTIVATION_PORT)
        private readonly authAccountReactivationPort: AuthAccountReactivationPort,
        @Inject(AUTH_SOCIAL_CALLBACK_PORT)
        private readonly authSocialCallbackPort: AuthSocialCallbackPort,
        private readonly authAccountReactivationPolicyService: AuthAccountReactivationPolicyService,
    ) {}

    async execute(reactivationToken: string): Promise<AuthAccountReactivationResult> {
        const payload = this.verifyToken(reactivationToken);

        const account = await this.authAccountReactivationPort.findById(payload.sub, payload.role);
        this.authAccountReactivationPolicyService.assertAccount(account);
        this.authAccountReactivationPolicyService.assertReactivatable(account.accountStatus);

        await this.authAccountReactivationPort.reactivate(account.userId, account.role);

        const tokens = await this.authSocialCallbackPort.generateSocialLoginTokens({
            userId: account.userId,
            email: account.email,
            name: account.name,
            role: account.role,
            profileImage: account.profileImage,
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            accessTokenExpiresIn: tokens.accessTokenExpiresIn,
            refreshTokenExpiresIn: tokens.refreshTokenExpiresIn,
            role: account.role,
            userInfo: tokens.userInfo,
        };
    }

    private verifyToken(reactivationToken: string) {
        try {
            return this.authTokenPort.verifyReactivationToken(reactivationToken);
        } catch (error) {
            if (hasErrorName(error, 'TokenExpiredError')) {
                this.authAccountReactivationPolicyService.throwExpiredReactivationToken();
            }

            if (hasErrorName(error, 'JsonWebTokenError')) {
                this.authAccountReactivationPolicyService.throwMalformedReactivationToken();
            }

            throw error;
        }
    }
}
