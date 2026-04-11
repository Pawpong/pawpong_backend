export type AuthSessionRole = 'adopter' | 'breeder';

export type AuthSessionUser = {
    readonly id: string;
    readonly email: string;
    readonly role: AuthSessionRole;
    readonly refreshTokenHash: string | null;
};

export const AUTH_SESSION_PORT = Symbol('AUTH_SESSION_PORT');

export interface AuthSessionPort {
    findById(userId: string, role: AuthSessionRole): Promise<AuthSessionUser | null>;
    updateRefreshToken(userId: string, role: AuthSessionRole, refreshTokenHash: string | null): Promise<void>;
}
