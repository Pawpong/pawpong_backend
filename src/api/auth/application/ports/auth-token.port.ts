import { type AuthSessionRole } from './auth-session.port';
import { type AuthTokenSet } from '../types/auth-token-set.type';

export type AuthRefreshTokenPayload = {
    sub: string;
    email: string;
    role: string;
    type?: string;
};

export abstract class AuthTokenPort {
    abstract generateTokens(userId: string, email: string, role: AuthSessionRole): AuthTokenSet;

    abstract verifyRefreshToken(refreshToken: string): AuthRefreshTokenPayload;

    abstract hashRefreshToken(refreshToken: string): Promise<string>;

    abstract compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean>;
}
