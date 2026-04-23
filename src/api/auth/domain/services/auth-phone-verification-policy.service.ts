import { Injectable } from '@nestjs/common';

import { DomainValidationError } from '../../../../common/error/domain.error';
import { AuthPhoneVerificationRecord } from '../../application/ports/auth-phone-verification-store.port';

@Injectable()
export class AuthPhoneVerificationPolicyService {
    private readonly maxAttempts = 5;
    private readonly codeExpiryMinutes = 3;

    normalizePhoneNumber(phone: string): string {
        const cleaned = phone.replace(/[^0-9]/g, '');

        if (!cleaned.match(/^01[0-9]{8,9}$/)) {
            throw new DomainValidationError('올바른 전화번호 형식이 아닙니다.');
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

    ensurePhoneAvailable(isWhitelisted: boolean, hasRegisteredPhone: boolean): void {
        if (!isWhitelisted && hasRegisteredPhone) {
            throw new DomainValidationError('이미 등록된 전화번호입니다.');
        }
    }

    ensureNoPendingVerification(verification?: AuthPhoneVerificationRecord): void {
        if (verification && !this.isExpired(verification.expiresAt)) {
            const remainingMinutes = this.getRemainingMinutes(verification.expiresAt);
            throw new DomainValidationError(
                `이미 발송된 인증코드가 있습니다. ${remainingMinutes}분 후에 재발송 가능합니다.`,
            );
        }
    }

    ensureVerificationRequested(
        verification?: AuthPhoneVerificationRecord,
    ): asserts verification is AuthPhoneVerificationRecord {
        if (!verification) {
            throw new DomainValidationError('인증번호를 먼저 요청해주세요.');
        }
    }

    ensureNotVerified(verification: AuthPhoneVerificationRecord): void {
        if (verification.verified) {
            throw new DomainValidationError('이미 인증이 완료되었습니다.');
        }
    }

    throwExpiredVerification(): never {
        throw new DomainValidationError('인증번호가 만료되었습니다. 다시 요청해주세요.');
    }

    isWithinMaxAttempts(attempts: number): boolean {
        return attempts <= this.maxAttempts;
    }

    throwAttemptsExceeded(): never {
        throw new DomainValidationError('인증 시도 횟수를 초과했습니다. 다시 요청해주세요.');
    }

    throwInvalidCode(attempts: number): never {
        throw new DomainValidationError(`인증번호가 일치하지 않습니다. (${attempts}/${this.maxAttempts})`);
    }
}
