import { type AuthSessionRole } from './auth-session.port';
import { type AuthTokenSet } from '../types/auth-token-set.type';

export type AuthRefreshTokenPayload = {
    sub: string;
    email: string;
    role: string;
    type?: string;
};

/** 탈퇴 계정 복구 동의 단계에서만 사용하는 단기 토큰의 페이로드 */
export type AuthReactivationTokenPayload = {
    sub: string;
    role: AuthSessionRole;
    type?: string;
};

export type AuthReactivationToken = {
    token: string;
    expiresIn: number;
};

export const AUTH_TOKEN_PORT = Symbol('AUTH_TOKEN_PORT');

export interface AuthTokenPort {
    generateTokens(userId: string, email: string, role: AuthSessionRole): AuthTokenSet;

    verifyRefreshToken(refreshToken: string): AuthRefreshTokenPayload;

    hashRefreshToken(refreshToken: string): Promise<string>;

    compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean>;

    /**
     * 탈퇴 계정 복구 확인용 단기 토큰을 발급한다.
     * 소셜 콜백에서만 발급되므로, 복구 API는 소셜 인증을 통과한 본인만 호출할 수 있다.
     */
    generateReactivationToken(userId: string, role: AuthSessionRole): AuthReactivationToken;

    verifyReactivationToken(reactivationToken: string): AuthReactivationTokenPayload;
}
