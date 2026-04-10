import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { type LogoutResult } from '../../application/types/auth-response.type';

@Injectable()
export class AuthLogoutResponseFactoryService {
    createLoggedOut(loggedOutAt: string): LogoutResult {
        return {
            success: true,
            loggedOutAt,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        };
    }
}
