import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
    AuthAdminIssuedTokenPayload,
    AuthAdminTokenPort,
    AuthAdminVerifiedTokenPayload,
} from '../application/ports/auth-admin-token.port';

@Injectable()
export class AuthAdminJwtAdapter implements AuthAdminTokenPort {
    constructor(private readonly jwtService: JwtService) {}

    createAccessToken(payload: AuthAdminIssuedTokenPayload): string {
        return this.jwtService.sign(payload, {
            expiresIn: '1h',
        });
    }

    createRefreshToken(payload: AuthAdminIssuedTokenPayload): string {
        return this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
    }

    verifyRefreshToken(refreshToken: string): AuthAdminVerifiedTokenPayload {
        return this.jwtService.verify(refreshToken) as AuthAdminVerifiedTokenPayload;
    }
}
