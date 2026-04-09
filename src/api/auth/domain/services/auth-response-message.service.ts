import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthResponseMessageService {
    getSignupCompleted(role: 'adopter' | 'breeder'): string {
        return role === 'adopter'
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted;
    }

    getSocialRegistrationCompleted(): string {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted;
    }

    getTokenRefreshed(): string {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.tokenRefreshed;
    }

    getDuplicateCheckMessage(kind: 'email' | 'nickname' | 'breederName', isDuplicate: boolean): string {
        if (kind === 'email') {
            return isDuplicate
                ? AUTH_RESPONSE_MESSAGE_EXAMPLES.emailDuplicated
                : AUTH_RESPONSE_MESSAGE_EXAMPLES.emailAvailable;
        }

        if (kind === 'nickname') {
            return isDuplicate
                ? AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameDuplicated
                : AUTH_RESPONSE_MESSAGE_EXAMPLES.nicknameAvailable;
        }

        return isDuplicate
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameDuplicated
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederNameAvailable;
    }

    getSocialUserCheckMessage(exists: boolean): string {
        return exists ? AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound : AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound;
    }

    getBannerListed(location: 'login' | 'signup'): string {
        return location === 'login'
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.loginBannersListed
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.registerBannersListed;
    }
}
