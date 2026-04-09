import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthRegistrationResponseMessageService {
    getSignupCompleted(role: 'adopter' | 'breeder'): string {
        return role === 'adopter'
            ? AUTH_RESPONSE_MESSAGE_EXAMPLES.adopterSignupCompleted
            : AUTH_RESPONSE_MESSAGE_EXAMPLES.breederSignupCompleted;
    }

    getSocialRegistrationCompleted(): string {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.socialRegistrationCompleted;
    }
}
