import { Injectable } from '@nestjs/common';

import { type AuthSocialCallbackResult } from '../../application/ports/auth-social-callback.port';

@Injectable()
export class AuthSocialErrorRedirectFactoryService {
    create(frontendUrl: string, errorMessage: string): AuthSocialCallbackResult {
        const errorParams = new URLSearchParams({
            error: errorMessage,
            type: errorMessage.includes('탈퇴')
                ? 'deleted_account'
                : errorMessage.includes('정지')
                  ? 'suspended_account'
                  : 'login_error',
        });

        return {
            redirectUrl: `${frontendUrl}/login?${errorParams.toString()}`,
        };
    }
}
