import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { hasErrorName } from '../../../../common/utils/error.util';

import { AuthSessionPort, type AuthSessionRole } from '../ports/auth-session.port';
import { AuthTokenPort } from '../ports/auth-token.port';
import { type AuthTokenSet } from '../types/auth-token-set.type';

@Injectable()
export class RefreshAuthTokenUseCase {
    constructor(
        @Inject(AuthSessionPort)
        private readonly authSessionPort: AuthSessionPort,
        @Inject(AuthTokenPort)
        private readonly authTokenPort: AuthTokenPort,
    ) {}

    async execute(refreshToken: string): Promise<AuthTokenSet> {
        try {
            const payload = this.authTokenPort.verifyRefreshToken(refreshToken);

            if (payload.role !== 'adopter' && payload.role !== 'breeder') {
                throw new UnauthorizedException('유효하지 않은 사용자 역할입니다.');
            }

            const user = await this.authSessionPort.findById(payload.sub, payload.role as AuthSessionRole);

            if (!user) {
                throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
            }

            if (!user.refreshTokenHash) {
                throw new UnauthorizedException('리프레시 토큰이 존재하지 않습니다.');
            }

            const isTokenValid = await this.authTokenPort.compareRefreshToken(
                refreshToken,
                user.refreshTokenHash,
            );

            if (!isTokenValid) {
                throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
            }

            const tokens = this.authTokenPort.generateTokens(user.id, user.email, user.role);
            const hashedRefreshToken = await this.authTokenPort.hashRefreshToken(tokens.refreshToken);

            await this.authSessionPort.updateRefreshToken(user.id, user.role, hashedRefreshToken);

            return tokens;
        } catch (error) {
            if (hasErrorName(error, 'TokenExpiredError')) {
                throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
            }

            if (hasErrorName(error, 'JsonWebTokenError')) {
                throw new UnauthorizedException('유효하지 않은 토큰 형식입니다.');
            }

            throw error;
        }
    }
}
