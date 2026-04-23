import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';

import type { AuthRefreshTokenPayload, AuthTokenPort } from '../application/ports/auth-token.port';
import { type AuthSessionRole } from '../application/ports/auth-session.port';
import { type AuthTokenSet } from '../application/types/auth-token-set.type';

@Injectable()
export class AuthJwtTokenAdapter implements AuthTokenPort {
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

    hashRefreshToken(refreshToken: string): Promise<string> {
        return bcrypt.hash(refreshToken, 10);
    }

    compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean> {
        return bcrypt.compare(refreshToken, hashedRefreshToken);
    }
}
