import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { LogoutResponseDto } from '../../dto/response/logout-response.dto';

@Injectable()
export class AuthLogoutResponseFactoryService {
    createLoggedOut(loggedOutAt: string): LogoutResponseDto {
        return {
            success: true,
            loggedOutAt,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        };
    }
}
