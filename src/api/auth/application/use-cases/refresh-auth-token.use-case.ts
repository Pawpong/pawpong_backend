import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import {
    AUTH_SESSION_PORT,
    type AuthSessionPort,
    type AuthSessionRole,
} from '../ports/auth-session.port';
import { AuthTokenService } from '../../services/auth-token.service';
import { RefreshTokenRequestDto } from '../../dto/request/refresh-token-request.dto';
import { TokenResponseDto } from '../../dto/response/token-response.dto';

@Injectable()
export class RefreshAuthTokenUseCase {
    constructor(
        @Inject(AUTH_SESSION_PORT)
        private readonly authSessionPort: AuthSessionPort,
        private readonly authTokenService: AuthTokenService,
    ) {}

    async execute(refreshTokenDto: RefreshTokenRequestDto): Promise<TokenResponseDto> {
        try {
            const payload = this.authTokenService.verifyRefreshToken(refreshTokenDto.refreshToken);

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

            const isTokenValid = await this.authTokenService.compareRefreshToken(
                refreshTokenDto.refreshToken,
                user.refreshTokenHash,
            );

            if (!isTokenValid) {
                throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
            }

            const tokens = this.authTokenService.generateTokens(user.id, user.email, user.role);
            const hashedRefreshToken = await this.authTokenService.hashRefreshToken(tokens.refreshToken);

            await this.authSessionPort.updateRefreshToken(user.id, user.role, hashedRefreshToken);

            return tokens;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');
            }

            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('유효하지 않은 토큰 형식입니다.');
            }

            throw error;
        }
    }
}
