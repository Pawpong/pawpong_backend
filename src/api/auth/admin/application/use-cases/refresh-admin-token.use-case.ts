import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AuthAdminAuthenticationService } from '../../domain/services/auth-admin-authentication.service';
import { AuthAdminPresentationService } from '../../domain/services/auth-admin-presentation.service';
import { AUTH_ADMIN_READER } from '../ports/auth-admin-reader.port';
import type { AuthAdminReaderPort } from '../ports/auth-admin-reader.port';
import { AUTH_ADMIN_TOKEN } from '../ports/auth-admin-token.port';
import type { AuthAdminTokenPort } from '../ports/auth-admin-token.port';

@Injectable()
export class RefreshAdminTokenUseCase {
    constructor(
        @Inject(AUTH_ADMIN_READER)
        private readonly authAdminReader: AuthAdminReaderPort,
        @Inject(AUTH_ADMIN_TOKEN)
        private readonly authAdminToken: AuthAdminTokenPort,
        private readonly authAdminAuthenticationService: AuthAdminAuthenticationService,
        private readonly authAdminPresentationService: AuthAdminPresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(refreshToken: string): Promise<{ accessToken: string }> {
        this.logger.logStart('refreshAdminToken', '관리자 토큰 갱신 시작');

        try {
            const payload = this.authAdminToken.verifyRefreshToken(refreshToken);

            if (payload.role !== 'admin') {
                this.logger.logError('refreshAdminToken', '관리자 권한 없음', new Error('관리자 토큰이 아닙니다'));
                this.authAdminAuthenticationService.throwInvalidToken();
            }

            const admin = await this.authAdminReader.findActiveByEmail(payload.email);

            if (!admin) {
                this.logger.logError('refreshAdminToken', '관리자 조회 실패', new Error('관리자를 찾을 수 없습니다'));
                this.authAdminAuthenticationService.throwInvalidToken();
            }

            this.authAdminAuthenticationService.assertAdminRole(payload);

            const accessToken = this.authAdminToken.createAccessToken({
                sub: payload.sub,
                email: payload.email,
                role: 'admin',
                adminLevel: payload.adminLevel || admin.adminLevel,
            });

            this.logger.logSuccess('refreshAdminToken', '관리자 토큰 갱신 성공', {
                adminId: payload.sub,
                email: payload.email,
            });

            return this.authAdminPresentationService.toRefreshResponse(accessToken);
        } catch (error) {
            this.logger.logError('refreshAdminToken', '토큰 갱신 실패', error);
            throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
}
