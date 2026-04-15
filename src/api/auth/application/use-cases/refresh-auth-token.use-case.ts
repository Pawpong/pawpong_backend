import { Inject, Injectable } from '@nestjs/common';
import { hasErrorName } from '../../../../common/utils/error.util';

import { AUTH_SESSION_PORT, type AuthSessionPort, type AuthSessionRole } from '../ports/auth-session.port';
import { AUTH_TOKEN_PORT, type AuthTokenPort } from '../ports/auth-token.port';
import { type AuthTokenSet } from '../types/auth-token-set.type';
import { AuthSessionAuthenticationService } from '../../domain/services/auth-session-authentication.service';

@Injectable()
export class RefreshAuthTokenUseCase {
    constructor(
        @Inject(AUTH_SESSION_PORT)
        private readonly authSessionPort: AuthSessionPort,
        @Inject(AUTH_TOKEN_PORT)
        private readonly authTokenPort: AuthTokenPort,
        private readonly authSessionAuthenticationService: AuthSessionAuthenticationService,
    ) {}

    async execute(refreshToken: string): Promise<AuthTokenSet> {
        try {
            const payload = this.authTokenPort.verifyRefreshToken(refreshToken);

            this.authSessionAuthenticationService.assertRefreshableRole(payload.role);

            const user = await this.authSessionPort.findById(payload.sub, payload.role as AuthSessionRole);

            this.authSessionAuthenticationService.assertUser(user);
            this.authSessionAuthenticationService.assertRefreshTokenHash(user.refreshTokenHash);

            const isTokenValid = await this.authTokenPort.compareRefreshToken(refreshToken, user.refreshTokenHash);

            this.authSessionAuthenticationService.assertRefreshTokenValid(isTokenValid);

            const tokens = this.authTokenPort.generateTokens(user.id, user.email, user.role);
            const hashedRefreshToken = await this.authTokenPort.hashRefreshToken(tokens.refreshToken);

            await this.authSessionPort.updateRefreshToken(user.id, user.role, hashedRefreshToken);

            return tokens;
        } catch (error) {
            if (hasErrorName(error, 'TokenExpiredError')) {
                this.authSessionAuthenticationService.throwExpiredRefreshToken();
            }

            if (hasErrorName(error, 'JsonWebTokenError')) {
                this.authSessionAuthenticationService.throwMalformedRefreshToken();
            }

            throw error;
        }
    }
}
