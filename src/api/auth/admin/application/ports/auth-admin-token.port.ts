export interface AuthAdminIssuedTokenPayload {
    sub: string;
    email: string;
    role: 'admin';
    adminLevel: string;
}

export interface AuthAdminVerifiedTokenPayload {
    sub: string;
    email: string;
    role: string;
    adminLevel?: string;
}

export const AUTH_ADMIN_TOKEN = Symbol('AUTH_ADMIN_TOKEN');

export interface AuthAdminTokenPort {
    createAccessToken(payload: AuthAdminIssuedTokenPayload): string;
    createRefreshToken(payload: AuthAdminIssuedTokenPayload): string;
    verifyRefreshToken(refreshToken: string): AuthAdminVerifiedTokenPayload;
}
