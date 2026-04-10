import { Inject, Injectable } from '@nestjs/common';

import { CustomLoggerService } from '../../../../../common/logger/custom-logger.service';
import { AuthAdminAuthenticationService } from '../../domain/services/auth-admin-authentication.service';
import { AuthAdminPresentationService } from '../../domain/services/auth-admin-presentation.service';
import { AUTH_ADMIN_PASSWORD } from '../ports/auth-admin-password.port';
import type { AuthAdminPasswordPort } from '../ports/auth-admin-password.port';
import { AUTH_ADMIN_READER } from '../ports/auth-admin-reader.port';
import type { AuthAdminReaderPort } from '../ports/auth-admin-reader.port';
import { AUTH_ADMIN_TOKEN } from '../ports/auth-admin-token.port';
import type { AuthAdminTokenPort } from '../ports/auth-admin-token.port';
import type { AdminLoginResult } from '../types/auth-admin-result.type';

@Injectable()
export class LoginAdminUseCase {
    constructor(
        @Inject(AUTH_ADMIN_READER)
        private readonly authAdminReader: AuthAdminReaderPort,
        @Inject(AUTH_ADMIN_PASSWORD)
        private readonly authAdminPassword: AuthAdminPasswordPort,
        @Inject(AUTH_ADMIN_TOKEN)
        private readonly authAdminToken: AuthAdminTokenPort,
        private readonly authAdminAuthenticationService: AuthAdminAuthenticationService,
        private readonly authAdminPresentationService: AuthAdminPresentationService,
        private readonly logger: CustomLoggerService,
    ) {}

    async execute(email: string, password: string): Promise<AdminLoginResult> {
        this.logger.logStart('loginAdmin', '관리자 로그인 시작', { email });

        const admin = await this.authAdminReader.findActiveByEmail(email);

        if (!admin) {
            this.logger.logError('loginAdmin', '관리자 조회 실패', new Error('관리자를 찾을 수 없습니다'));
            this.authAdminAuthenticationService.throwInvalidCredentials();
        }

        const isPasswordValid = await this.authAdminPassword.compare(password, admin.passwordHash);

        if (!isPasswordValid) {
            this.logger.logError('loginAdmin', '비밀번호 불일치', new Error('비밀번호가 올바르지 않습니다'));
            this.authAdminAuthenticationService.throwInvalidCredentials();
        }

        await this.authAdminReader.updateLastLogin(admin.adminId);

        const payload = this.authAdminAuthenticationService.toTokenPayload(admin);
        const accessToken = this.authAdminToken.createAccessToken(payload);
        const refreshToken = this.authAdminToken.createRefreshToken(payload);
        const response = this.authAdminPresentationService.toLoginResponse(admin, {
            accessToken,
            refreshToken,
        });

        this.logger.logSuccess('loginAdmin', '관리자 로그인 성공', {
            adminId: admin.adminId,
            email: admin.email,
            adminLevel: admin.adminLevel,
        });

        return response;
    }
}
