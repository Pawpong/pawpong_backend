import { BadRequestException, Injectable } from '@nestjs/common';

import { AuthPhoneVerificationRecord } from '../../application/ports/auth-phone-verification-store.port';

@Injectable()
export class AuthPhoneVerificationPolicyService {
    private readonly maxAttempts = 5;
    private readonly codeExpiryMinutes = 3;

    normalizePhoneNumber(phone: string): string {
        const cleaned = phone.replace(/[^0-9]/g, '');

        if (!cleaned.match(/^01[0-9]{8,9}$/)) {
            throw new BadRequestException('올바른 전화번호 형식이 아닙니다.');
        }

        return cleaned;
    }

    generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    createPendingVerification(phone: string, code: string): AuthPhoneVerificationRecord {
        return {
            phone,
            code,
            expiresAt: new Date(Date.now() + this.codeExpiryMinutes * 60 * 1000),
            attempts: 0,
            verified: false,
        };
    }

    isExpired(expiresAt: Date): boolean {
        return expiresAt.getTime() < Date.now();
    }

    getRemainingMinutes(expiresAt: Date): number {
        return Math.ceil((expiresAt.getTime() - Date.now()) / 1000 / 60);
    }

    getMaxAttempts(): number {
        return this.maxAttempts;
    }
}
