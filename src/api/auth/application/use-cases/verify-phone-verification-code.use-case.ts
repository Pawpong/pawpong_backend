import { Inject, Injectable } from '@nestjs/common';

import { AUTH_PHONE_VERIFICATION_STORE_PORT } from '../ports/auth-phone-verification-store.port';
import type { AuthPhoneVerificationStorePort } from '../ports/auth-phone-verification-store.port';
import { type PhoneVerificationResult } from '../types/auth-response.type';
import { buildAuthPhoneVerificationCompletedResult } from '../../constants/auth-response-messages';
import { AuthPhoneVerificationPolicyService } from '../../domain/services/auth-phone-verification-policy.service';

@Injectable()
export class VerifyPhoneVerificationCodeUseCase {
    constructor(
        @Inject(AUTH_PHONE_VERIFICATION_STORE_PORT)
        private readonly authPhoneVerificationStorePort: AuthPhoneVerificationStorePort,
        private readonly authPhoneVerificationPolicyService: AuthPhoneVerificationPolicyService,
    ) {}

    execute(phone: string, code: string): PhoneVerificationResult {
        const normalizedPhone = this.authPhoneVerificationPolicyService.normalizePhoneNumber(phone);
        const verification = this.authPhoneVerificationStorePort.get(normalizedPhone);

        this.authPhoneVerificationPolicyService.ensureVerificationRequested(verification);
        this.authPhoneVerificationPolicyService.ensureNotVerified(verification);

        if (this.authPhoneVerificationPolicyService.isExpired(verification.expiresAt)) {
            this.authPhoneVerificationStorePort.delete(normalizedPhone);
            this.authPhoneVerificationPolicyService.throwExpiredVerification();
        }

        verification.attempts += 1;

        if (!this.authPhoneVerificationPolicyService.isWithinMaxAttempts(verification.attempts)) {
            this.authPhoneVerificationStorePort.delete(normalizedPhone);
            this.authPhoneVerificationPolicyService.throwAttemptsExceeded();
        }

        if (verification.code !== code) {
            this.authPhoneVerificationStorePort.save(verification);
            this.authPhoneVerificationPolicyService.throwInvalidCode(verification.attempts);
        }

        verification.verified = true;
        this.authPhoneVerificationStorePort.save(verification);

        return buildAuthPhoneVerificationCompletedResult();
    }
}
