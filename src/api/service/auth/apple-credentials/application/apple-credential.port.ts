export const APPLE_CREDENTIAL_PORT = Symbol('APPLE_CREDENTIAL_PORT');

export interface AppleStoredCredential {
    subjectDigest: string;
    encryptedRefreshToken?: string;
    state: 'available' | 'revoking' | 'revoked';
    revocationStatus?: 'revoked' | 'manual_disconnect_required';
}

export interface AppleCredentialPort {
    save(subjectDigest: string, encryptedRefreshToken: string): Promise<void>;
    lockForRevocation(subjectDigest: string): Promise<AppleStoredCredential>;
    finishRevocation(subjectDigest: string, status: 'revoked' | 'manual_disconnect_required'): Promise<void>;
}
