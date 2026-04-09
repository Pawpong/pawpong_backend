import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthSessionResponseMessageService {
    getTokenRefreshed(): string {
        return AUTH_RESPONSE_MESSAGE_EXAMPLES.tokenRefreshed;
    }
}
