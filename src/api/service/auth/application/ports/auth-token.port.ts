import { type AuthSessionRole } from './auth-session.port';
import { type AuthTokenSet } from '../types/auth-token-set.type';

export type AuthRefreshTokenPayload = {
    sub: string;
    email: string;
    role: string;
    type?: string;
};

export const AUTH_TOKEN_PORT = Symbol('AUTH_TOKEN_PORT');

export interface AuthTokenPort {
    generateTokens(userId: string, email: string, role: AuthSessionRole): AuthTokenSet;

    verifyRefreshToken(refreshToken: string): AuthRefreshTokenPayload;

    hashRefreshToken(refreshToken: string): Promise<string>;

    compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean>;
}
