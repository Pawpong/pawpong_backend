import { Inject, Injectable } from '@nestjs/common';

import { AUTH_PHONE_VERIFICATION_REGISTRY_PORT } from '../ports/auth-phone-verification-registry.port';
import { AUTH_PHONE_VERIFICATION_SENDER_PORT } from '../ports/auth-phone-verification-sender.port';
import { AUTH_PHONE_VERIFICATION_STORE_PORT } from '../ports/auth-phone-verification-store.port';
import type { AuthPhoneVerificationRegistryPort } from '../ports/auth-phone-verification-registry.port';
import type { AuthPhoneVerificationSenderPort } from '../ports/auth-phone-verification-sender.port';
import type { AuthPhoneVerificationStorePort } from '../ports/auth-phone-verification-store.port';
import { type PhoneVerificationResult } from '../types/auth-response.type';
import { buildAuthPhoneVerificationCodeSentResult } from '../../constants/auth-response-messages';
import { AuthPhoneVerificationPolicyService } from '../../domain/services/auth-phone-verification-policy.service';

@Injectable()
export class SendPhoneVerificationCodeUseCase {
    constructor(
        @Inject(AUTH_PHONE_VERIFICATION_REGISTRY_PORT)
        private readonly authPhoneVerificationRegistryPort: AuthPhoneVerificationRegistryPort,
        @Inject(AUTH_PHONE_VERIFICATION_STORE_PORT)
        private readonly authPhoneVerificationStorePort: AuthPhoneVerificationStorePort,
        @Inject(AUTH_PHONE_VERIFICATION_SENDER_PORT)
        private readonly authPhoneVerificationSenderPort: AuthPhoneVerificationSenderPort,
        private readonly authPhoneVerificationPolicyService: AuthPhoneVerificationPolicyService,
    ) {}

    async execute(phone: string): Promise<PhoneVerificationResult> {
        const normalizedPhone = this.authPhoneVerificationPolicyService.normalizePhoneNumber(phone);
        const isWhitelisted = await this.authPhoneVerificationRegistryPort.isPhoneWhitelisted(normalizedPhone);

        let hasRegisteredPhone = false;
        if (!isWhitelisted) {
            hasRegisteredPhone = await this.authPhoneVerificationRegistryPort.hasRegisteredPhone(normalizedPhone);
        }
        this.authPhoneVerificationPolicyService.ensurePhoneAvailable(isWhitelisted, hasRegisteredPhone);

        const existingVerification = this.authPhoneVerificationStorePort.get(normalizedPhone);
        this.authPhoneVerificationPolicyService.ensureNoPendingVerification(existingVerification);

        const verificationCode = this.authPhoneVerificationPolicyService.generateVerificationCode();
        const verification = this.authPhoneVerificationPolicyService.createPendingVerification(
            normalizedPhone,
            verificationCode,
        );

        await this.authPhoneVerificationSenderPort.sendVerificationCode(normalizedPhone, verificationCode);
        this.authPhoneVerificationStorePort.save(verification);

        return buildAuthPhoneVerificationCodeSentResult();
    }
}
