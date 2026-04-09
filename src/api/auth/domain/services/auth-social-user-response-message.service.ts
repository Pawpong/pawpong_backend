import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthSocialUserResponseMessageService {
    getSocialUserCheckMessage(exists: boolean): string {
        return exists ? AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserFound : AUTH_RESPONSE_MESSAGE_EXAMPLES.socialUserNotFound;
    }
}
