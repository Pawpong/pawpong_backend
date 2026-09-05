export const AUTH_PHONE_VERIFICATION_STORE_PORT = Symbol('AUTH_PHONE_VERIFICATION_STORE_PORT');

export interface AuthPhoneVerificationRecord {
    phone: string;
    code: string;
    expiresAt: Date;
    attempts: number;
    verified: boolean;
}

export interface AuthPhoneVerificationStorePort {
    get(phoneNumber: string): AuthPhoneVerificationRecord | undefined;
    save(record: AuthPhoneVerificationRecord): void;
    delete(phoneNumber: string): void;
    cleanupExpired(now: Date): void;
}
