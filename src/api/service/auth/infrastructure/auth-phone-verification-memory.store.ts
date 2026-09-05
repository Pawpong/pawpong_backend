import { Injectable } from '@nestjs/common';

import {
    AuthPhoneVerificationRecord,
    AuthPhoneVerificationStorePort,
} from '../application/ports/auth-phone-verification-store.port';

@Injectable()
export class AuthPhoneVerificationMemoryStore implements AuthPhoneVerificationStorePort {
    private readonly verificationCodes = new Map<string, AuthPhoneVerificationRecord>();

    get(phoneNumber: string): AuthPhoneVerificationRecord | undefined {
        return this.verificationCodes.get(phoneNumber);
    }

    save(record: AuthPhoneVerificationRecord): void {
        this.verificationCodes.set(record.phone, record);
    }

    delete(phoneNumber: string): void {
        this.verificationCodes.delete(phoneNumber);
    }

    cleanupExpired(now: Date): void {
        for (const [phone, verification] of this.verificationCodes.entries()) {
            if (verification.expiresAt.getTime() < now.getTime()) {
                this.verificationCodes.delete(phone);
            }
        }
    }
}
