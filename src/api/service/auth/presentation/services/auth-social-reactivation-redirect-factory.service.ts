import { Injectable } from '@nestjs/common';

import {
    type AuthSocialCallbackResult,
    type AuthSocialCallbackRole,
} from '../../application/ports/auth-social-callback.port';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

type ReactivationInput = {
    frontendUrl: string;
    originUrl?: string;
    reactivationToken: string;
    expiresIn: number;
    role: AuthSocialCallbackRole;
    email: string;
    name: string;
    deletedAt?: string;
};

/**
 * 탈퇴 계정의 소셜 로그인을 복구 확인 화면으로 보낸다.
 * 기존 프론트가 분기하던 `type=deleted_account` 는 그대로 유지하고,
 * 복구에 필요한 단기 토큰만 추가로 전달한다.
 */
@Injectable()
export class AuthSocialReactivationRedirectFactoryService {
    create(input: ReactivationInput): AuthSocialCallbackResult {
        const params: Record<string, string> = {
            type: 'deleted_account',
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.accountReactivationRequired,
            reactivationToken: input.reactivationToken,
            expiresIn: String(input.expiresIn),
            role: input.role,
            email: input.email,
            name: input.name,
        };

        if (input.deletedAt) {
            params.deletedAt = input.deletedAt;
        }

        if (input.originUrl) {
            params.returnUrl = input.originUrl;
        }

        return {
            redirectUrl: `${input.frontendUrl}/login?${new URLSearchParams(params).toString()}`,
        };
    }
}
