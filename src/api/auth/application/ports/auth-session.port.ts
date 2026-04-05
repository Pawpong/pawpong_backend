export type AuthSessionRole = 'adopter' | 'breeder';

export type AuthSessionUser = {
    readonly id: string;
    readonly email: string;
    readonly role: AuthSessionRole;
    readonly refreshTokenHash: string | null;
};

export abstract class AuthSessionPort {
    abstract findById(userId: string, role: AuthSessionRole): Promise<AuthSessionUser | null>;
    abstract updateRefreshToken(userId: string, role: AuthSessionRole, refreshTokenHash: string | null): Promise<void>;
}
