import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';

@Injectable()
export class AuthDuplicateCheckResponseMessageService {
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
}
