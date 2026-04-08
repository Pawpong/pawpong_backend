import { TokenResponseDto } from '../../dto/response/token-response.dto';
import { type AuthSessionRole } from './auth-session.port';

export type AuthRefreshTokenPayload = {
    sub: string;
    email: string;
    role: string;
    type?: string;
};

export abstract class AuthTokenPort {
    abstract generateTokens(userId: string, email: string, role: AuthSessionRole): TokenResponseDto;

    abstract verifyRefreshToken(refreshToken: string): AuthRefreshTokenPayload;

    abstract hashRefreshToken(refreshToken: string): Promise<string>;

    abstract compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean>;
}
