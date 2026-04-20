import { Injectable } from '@nestjs/common';

import {
    type AuthSocialCallbackProfile,
    type AuthSocialCallbackResult,
} from '../../application/ports/auth-social-callback.port';

@Injectable()
export class AuthSocialSignupRedirectFactoryService {
    create(input: {
        frontendUrl: string;
        userProfile: AuthSocialCallbackProfile;
        tempUserId: string;
    }): AuthSocialCallbackResult {
        const params: Record<string, string> = {
            tempId: input.tempUserId,
            provider: input.userProfile.provider || '',
            email: input.userProfile.email || '',
            name: input.userProfile.name || '',
            profileImage: input.userProfile.profileImage || '',
        };

        if (input.userProfile.needsEmail) {
            params.needsEmail = 'true';
        }

        return {
            redirectUrl: `${input.frontendUrl}/signup?${new URLSearchParams(params).toString()}`,
        };
    }
}
