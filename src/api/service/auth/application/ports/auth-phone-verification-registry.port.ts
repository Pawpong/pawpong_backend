export const AUTH_PHONE_VERIFICATION_REGISTRY_PORT = Symbol('AUTH_PHONE_VERIFICATION_REGISTRY_PORT');

export interface AuthPhoneVerificationRegistryPort {
    isPhoneWhitelisted(phoneNumber: string): Promise<boolean>;
    hasRegisteredPhone(phoneNumber: string): Promise<boolean>;
}
