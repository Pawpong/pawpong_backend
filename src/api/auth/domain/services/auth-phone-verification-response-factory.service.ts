import { Injectable } from '@nestjs/common';

import { AUTH_RESPONSE_MESSAGE_EXAMPLES } from '../../constants/auth-response-messages';
import { PhoneVerificationResponseDto } from '../../dto/response/phone-verification-response.dto';

@Injectable()
export class AuthPhoneVerificationResponseFactoryService {
    createPhoneVerificationCodeSent(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCodeSent);
    }

    createPhoneVerificationCompleted(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, AUTH_RESPONSE_MESSAGE_EXAMPLES.phoneVerificationCompleted);
    }
}
