import { Inject, Injectable } from '@nestjs/common';

import { AUTH_PHONE_VERIFICATION_STORE_PORT } from './application/ports/auth-phone-verification-store.port';
import type { AuthPhoneVerificationStorePort } from './application/ports/auth-phone-verification-store.port';
import { SendPhoneVerificationCodeUseCase } from './application/use-cases/send-phone-verification-code.use-case';
import { VerifyPhoneVerificationCodeUseCase } from './application/use-cases/verify-phone-verification-code.use-case';
import { AuthPhoneVerificationPolicyService } from './domain/services/auth-phone-verification-policy.service';

@Injectable()
export class SmsService {
    constructor(
        private readonly sendPhoneVerificationCodeUseCase: SendPhoneVerificationCodeUseCase,
        private readonly verifyPhoneVerificationCodeUseCase: VerifyPhoneVerificationCodeUseCase,
        private readonly authPhoneVerificationPolicyService: AuthPhoneVerificationPolicyService,
        @Inject(AUTH_PHONE_VERIFICATION_STORE_PORT)
        private readonly authPhoneVerificationStorePort: AuthPhoneVerificationStorePort,
    ) {}

    async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
        return this.sendPhoneVerificationCodeUseCase.execute(phone);
    }

    async verifyCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
        return this.verifyPhoneVerificationCodeUseCase.execute(phone, code);
    }

    isPhoneVerified(phone: string): boolean {
        const normalizedPhone = this.authPhoneVerificationPolicyService.normalizePhoneNumber(phone);
        const verification = this.authPhoneVerificationStorePort.get(normalizedPhone);

        return (
            verification?.verified === true &&
            !this.authPhoneVerificationPolicyService.isExpired(verification.expiresAt)
        );
    }

    clearVerification(phone: string): void {
        const normalizedPhone = this.authPhoneVerificationPolicyService.normalizePhoneNumber(phone);
        this.authPhoneVerificationStorePort.delete(normalizedPhone);
    }

    cleanupExpiredCodes(): void {
        this.authPhoneVerificationStorePort.cleanupExpired(new Date());
    }
}
