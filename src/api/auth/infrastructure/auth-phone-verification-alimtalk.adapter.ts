import { Injectable, Logger } from '@nestjs/common';

import { AlimtalkService } from '../../../common/alimtalk/alimtalk.service';
import {
    AuthPhoneVerificationSendResult,
    AuthPhoneVerificationSenderPort,
} from '../application/ports/auth-phone-verification-sender.port';

@Injectable()
export class AuthPhoneVerificationAlimtalkAdapter implements AuthPhoneVerificationSenderPort {
    private readonly logger = new Logger(AuthPhoneVerificationAlimtalkAdapter.name);

    constructor(private readonly alimtalkService: AlimtalkService) {}

    async sendVerificationCode(phoneNumber: string, verificationCode: string): Promise<AuthPhoneVerificationSendResult> {
        const result = await this.alimtalkService.sendVerificationCode(phoneNumber, verificationCode);

        if (result.success) {
            this.logger.log(`[sendVerificationCode] 알림톡 인증번호 발송 성공: ${phoneNumber}`);
        } else {
            this.logger.warn(`[sendVerificationCode] 알림톡 발송 실패: ${result.error}`);
        }

        return result;
    }
}
