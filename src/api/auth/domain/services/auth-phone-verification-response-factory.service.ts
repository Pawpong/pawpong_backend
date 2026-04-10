import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { type PhoneVerificationResult } from '../../application/types/auth-response.type';

@Injectable()
export class AuthPhoneVerificationResponseFactoryService {
    createPhoneVerificationCodeSent(): PhoneVerificationResult {
        return {
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent,
        };
    }

    createPhoneVerificationCompleted(): PhoneVerificationResult {
        return {
            success: true,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted,
        };
    }
}
