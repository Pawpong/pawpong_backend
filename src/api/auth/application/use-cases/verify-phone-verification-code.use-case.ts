import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { AUTH_PHONE_VERIFICATION_STORE_PORT } from '../ports/auth-phone-verification-store.port';
import type { AuthPhoneVerificationStorePort } from '../ports/auth-phone-verification-store.port';
import { AuthPhoneVerificationPolicyService } from '../../domain/services/auth-phone-verification-policy.service';

@Injectable()
export class VerifyPhoneVerificationCodeUseCase {
    constructor(
        @Inject(AUTH_PHONE_VERIFICATION_STORE_PORT)
        private readonly authPhoneVerificationStorePort: AuthPhoneVerificationStorePort,
        private readonly authPhoneVerificationPolicyService: AuthPhoneVerificationPolicyService,
    ) {}

    execute(phone: string, code: string): { success: boolean; message: string } {
        const normalizedPhone = this.authPhoneVerificationPolicyService.normalizePhoneNumber(phone);
        const verification = this.authPhoneVerificationStorePort.get(normalizedPhone);

        if (!verification) {
            throw new BadRequestException('인증번호를 먼저 요청해주세요.');
        }

        if (verification.verified) {
            throw new BadRequestException('이미 인증이 완료되었습니다.');
        }

        if (this.authPhoneVerificationPolicyService.isExpired(verification.expiresAt)) {
            this.authPhoneVerificationStorePort.delete(normalizedPhone);
            throw new BadRequestException('인증번호가 만료되었습니다. 다시 요청해주세요.');
        }

        verification.attempts += 1;

        if (verification.attempts > this.authPhoneVerificationPolicyService.getMaxAttempts()) {
            this.authPhoneVerificationStorePort.delete(normalizedPhone);
            throw new BadRequestException('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.');
        }

        if (verification.code !== code) {
            this.authPhoneVerificationStorePort.save(verification);
            throw new BadRequestException(
                `인증번호가 일치하지 않습니다. (${verification.attempts}/${this.authPhoneVerificationPolicyService.getMaxAttempts()})`,
            );
        }

        verification.verified = true;
        this.authPhoneVerificationStorePort.save(verification);

        return {
            success: true,
            message: '전화번호 인증이 완료되었습니다.',
        };
    }
}
