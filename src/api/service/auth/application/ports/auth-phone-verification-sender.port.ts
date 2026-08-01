export const AUTH_PHONE_VERIFICATION_SENDER_PORT = Symbol('AUTH_PHONE_VERIFICATION_SENDER_PORT');

export interface AuthPhoneVerificationSendResult {
    success: boolean;
    error?: string;
}

export interface AuthPhoneVerificationSenderPort {
    sendVerificationCode(phoneNumber: string, verificationCode: string): Promise<AuthPhoneVerificationSendResult>;
}
