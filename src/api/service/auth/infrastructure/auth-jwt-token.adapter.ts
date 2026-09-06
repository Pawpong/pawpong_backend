import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { JsonWebTokenError } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import type {
    AuthReactivationToken,
    AuthReactivationTokenPayload,
    AuthRefreshTokenPayload,
    AuthTokenPort,
} from '../application/ports/auth-token.port';
import { type AuthSessionRole } from '../application/ports/auth-session.port';
import { type AuthTokenSet } from '../application/types/auth-token-set.type';

@Injectable()
export class AuthJwtTokenAdapter implements AuthTokenPort {
    /** 복구 동의 단계에서만 쓰이는 토큰이므로 짧게 유지한다. */
    private static readonly REACTIVATION_TOKEN_TYPE = 'reactivation';
    private static readonly REACTIVATION_TOKEN_EXPIRES_IN_SECONDS = 600;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    generateTokens(userId: string, email: string, role: AuthSessionRole): AuthTokenSet {
        const payload = {
            sub: userId,
            email,
            role,
        };

        const jwtExpiration = (this.configService.get<string>('JWT_EXPIRATION') || '24h') as StringValue;
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: jwtExpiration,
        });

        const jwtRefreshExpiration = (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as StringValue;
        const refreshToken = this.jwtService.sign(
            { ...payload, type: 'refresh' },
            {
                expiresIn: jwtRefreshExpiration,
            },
        );

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresIn: 3600,
            refreshTokenExpiresIn: 604800,
        };
    }

    verifyRefreshToken(refreshToken: string): AuthRefreshTokenPayload {
        return this.jwtService.verify(refreshToken);
    }

    generateReactivationToken(userId: string, role: AuthSessionRole): AuthReactivationToken {
        const expiresIn = AuthJwtTokenAdapter.REACTIVATION_TOKEN_EXPIRES_IN_SECONDS;
        const token = this.jwtService.sign(
            { sub: userId, role, type: AuthJwtTokenAdapter.REACTIVATION_TOKEN_TYPE },
            { expiresIn },
        );

        return { token, expiresIn };
    }

    verifyReactivationToken(reactivationToken: string): AuthReactivationTokenPayload {
        const payload = this.jwtService.verify<AuthReactivationTokenPayload>(reactivationToken);

        // 액세스/리프레시 토큰으로는 복구를 호출할 수 없도록 발급 용도를 확인한다.
        if (payload.type !== AuthJwtTokenAdapter.REACTIVATION_TOKEN_TYPE) {
            throw new JsonWebTokenError('invalid reactivation token type');
        }

        return payload;
    }

    hashRefreshToken(refreshToken: string): Promise<string> {
        return bcrypt.hash(refreshToken, 10);
    }

    compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean> {
        return bcrypt.compare(refreshToken, hashedRefreshToken);
    }
}
