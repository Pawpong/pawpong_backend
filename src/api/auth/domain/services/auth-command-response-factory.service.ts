import { Injectable } from '@nestjs/common';

import { LogoutResponseDto } from '../../dto/response/logout-response.dto';
import { PhoneVerificationResponseDto } from '../../dto/response/phone-verification-response.dto';
import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from './auth-response-message.service';

@Injectable()
export class AuthCommandResponseFactoryService {
    createPhoneVerificationCodeSent(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent);
    }

    createPhoneVerificationCompleted(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted);
    }

    createLoggedOut(loggedOutAt: string): LogoutResponseDto {
        return {
            success: true,
            loggedOutAt,
            message: AUTH_RESPONSE_MESSAGE_EXAMPLES.logoutCompleted,
        };
    }
}
