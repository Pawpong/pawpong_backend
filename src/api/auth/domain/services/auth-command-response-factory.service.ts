import { Injectable } from '@nestjs/common';

import { LogoutResponseDto } from '../../dto/response/logout-response.dto';
import { PhoneVerificationResponseDto } from '../../dto/response/phone-verification-response.dto';

@Injectable()
export class AuthCommandResponseFactoryService {
    createPhoneVerificationCodeSent(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, '인증번호가 발송되었습니다.');
    }

    createPhoneVerificationCompleted(): PhoneVerificationResponseDto {
        return new PhoneVerificationResponseDto(true, '전화번호 인증이 완료되었습니다.');
    }

    createLoggedOut(loggedOutAt: string): LogoutResponseDto {
        return {
            success: true,
            loggedOutAt,
            message: '로그아웃되었습니다.',
        };
    }
}
