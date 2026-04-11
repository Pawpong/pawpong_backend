import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';

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

        if (!isWhitelisted) {
            const hasRegisteredPhone = await this.authPhoneVerificationRegistryPort.hasRegisteredPhone(normalizedPhone);
            if (hasRegisteredPhone) {
                throw new BadRequestException('이미 등록된 전화번호입니다.');
            }
        }

        const existingVerification = this.authPhoneVerificationStorePort.get(normalizedPhone);
        if (existingVerification && !this.authPhoneVerificationPolicyService.isExpired(existingVerification.expiresAt)) {
            const remainingMinutes = this.authPhoneVerificationPolicyService.getRemainingMinutes(
                existingVerification.expiresAt,
            );
            throw new BadRequestException(
                `이미 발송된 인증코드가 있습니다. ${remainingMinutes}분 후에 재발송 가능합니다.`,
            );
        }

        const verificationCode = this.authPhoneVerificationPolicyService.generateVerificationCode();
        const verification = this.authPhoneVerificationPolicyService.createPendingVerification(
            normalizedPhone,
            verificationCode,
        );

        try {
            await this.authPhoneVerificationSenderPort.sendVerificationCode(normalizedPhone, verificationCode);
            this.authPhoneVerificationStorePort.save(verification);
        } catch (error) {
            throw new InternalServerErrorException('인증번호 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }

        return buildAuthPhoneVerificationCodeSentResult();
    }
}
