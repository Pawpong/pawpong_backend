import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { AuthTokenPort, type AuthRefreshTokenPayload } from '../application/ports/auth-token.port';
import { type AuthSessionRole } from '../application/ports/auth-session.port';
import { TokenResponseDto } from '../dto/response/token-response.dto';

@Injectable()
export class AuthJwtTokenAdapter extends AuthTokenPort {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    generateTokens(userId: string, email: string, role: AuthSessionRole): TokenResponseDto {
        const payload = {
            sub: userId,
            email,
            role,
        };

        const jwtExpiration = (this.configService.get<string>('JWT_EXPIRATION') || '24h') as string;
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: jwtExpiration as any,
        });

        const jwtRefreshExpiration = (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as string;
        const refreshToken = this.jwtService.sign(
            { ...payload, type: 'refresh' },
            {
                expiresIn: jwtRefreshExpiration as any,
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
        return this.jwtService.verify(refreshToken) as AuthRefreshTokenPayload;
    }

    hashRefreshToken(refreshToken: string): Promise<string> {
        return bcrypt.hash(refreshToken, 10);
    }

    compareRefreshToken(refreshToken: string, hashedRefreshToken: string): Promise<boolean> {
        return bcrypt.compare(refreshToken, hashedRefreshToken);
    }
}
