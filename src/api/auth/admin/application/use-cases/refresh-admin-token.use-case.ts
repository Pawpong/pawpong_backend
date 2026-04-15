import { Injectable, Inject } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { rethrowIfHttpException } from '../../../../../common/utils/http-exception.util';
import { AuthAdminAuthenticationService } from '../../domain/services/auth-admin-authentication.service';
import { AuthAdminRefreshTokenResultMapperService } from '../../domain/services/auth-admin-refresh-token-result-mapper.service';
import { AUTH_ADMIN_READER_PORT } from '../ports/auth-admin-reader.port';
import type { AuthAdminReaderPort } from '../ports/auth-admin-reader.port';
import { AUTH_ADMIN_TOKEN_PORT } from '../ports/auth-admin-token.port';
import type { AuthAdminTokenPort, AuthAdminVerifiedTokenPayload } from '../ports/auth-admin-token.port';

@Injectable()
export class RefreshAdminTokenUseCase {
    constructor(
        @Inject(AUTH_ADMIN_READER_PORT)
        private readonly authAdminReader: AuthAdminReaderPort,
        @Inject(AUTH_ADMIN_TOKEN_PORT)
        private readonly authAdminToken: AuthAdminTokenPort,
        private readonly authAdminAuthenticationService: AuthAdminAuthenticationService,
        private readonly authAdminRefreshTokenResultMapperService: AuthAdminRefreshTokenResultMapperService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(refreshToken: string): Promise<{ accessToken: string }> {
        this.logger.logStart('refreshAdminToken', '관리자 토큰 갱신 시작');

        let payload: AuthAdminVerifiedTokenPayload;
        try {
            payload = this.authAdminToken.verifyRefreshToken(refreshToken);
        } catch (error) {
            this.logger.logError('refreshAdminToken', '리프레시 토큰 검증 실패', error);
            rethrowIfHttpException(error);
            this.authAdminAuthenticationService.throwInvalidToken();
        }

        try {
            this.authAdminAuthenticationService.assertAdminRole(payload);

            const admin = await this.authAdminReader.findActiveByEmail(payload.email);

            if (!admin) {
                this.logger.logError('refreshAdminToken', '관리자 조회 실패', new Error('관리자를 찾을 수 없습니다'));
                this.authAdminAuthenticationService.throwInvalidToken();
            }

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

            return this.authAdminRefreshTokenResultMapperService.toResult(accessToken);
        } catch (error) {
            this.logger.logError('refreshAdminToken', '토큰 갱신 실패', error);
            rethrowIfHttpException(error);
            throw error;
        }
    }
}
