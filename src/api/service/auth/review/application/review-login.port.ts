import type { AuthSessionRole } from '../../application/ports/auth-session.port';

export type ReviewCredentialRecord = {
    id: string;
    emailAddress: string;
    accountId: string;
    role: AuthSessionRole;
    passwordHash: string;
    enabled: boolean;
};

export type ReviewAccount = {
    id: string;
    emailAddress: string;
    nickname: string;
    role: AuthSessionRole;
};

export const REVIEW_ACCOUNT_PORT = Symbol('REVIEW_ACCOUNT_PORT');
export interface ReviewAccountPort {
    findCredential(emailAddress: string): Promise<ReviewCredentialRecord | null>;
    findActiveAccount(credential: ReviewCredentialRecord): Promise<ReviewAccount | null>;
    saveSession(credential: ReviewCredentialRecord, refreshTokenHash: string): Promise<boolean>;
}

export const REVIEW_PASSWORD_PORT = Symbol('REVIEW_PASSWORD_PORT');
export interface ReviewPasswordPort {
    verify(password: string, passwordHash: string | null): Promise<boolean>;
}

export const REVIEW_LOGIN_LIMIT_PORT = Symbol('REVIEW_LOGIN_LIMIT_PORT');
export interface ReviewLoginLimitPort {
    allow(clientIp: string, emailAddress: string): Promise<boolean>;
}
