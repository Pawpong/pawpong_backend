import { Injectable } from '@nestjs/common';

import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';
import { LoginAdminUseCase } from './application/use-cases/login-admin.use-case';
import { RefreshAdminTokenUseCase } from './application/use-cases/refresh-admin-token.use-case';

/**
 * 관리자 인증 서비스
 *
 * 관리자 로그인, JWT 토큰 생성 등 관리자 인증 관련 비즈니스 로직을 처리합니다.
 *
 * 배너 관리 기능은 BreederManagementAdminService로 이관됨
 */
@Injectable()
export class AuthAdminService {
    constructor(
        private readonly loginAdminUseCase: LoginAdminUseCase,
        private readonly refreshAdminTokenUseCase: RefreshAdminTokenUseCase,
    ) {}

    // ==================== 인증 관련 ====================

    /**
     * 관리자 로그인
     *
     * 이메일과 비밀번호로 관리자 인증 후 JWT 토큰을 발급합니다.
     *
     * @param email - 관리자 이메일
     * @param password - 관리자 비밀번호
     * @returns 관리자 정보 및 JWT 토큰
     *
     * @throws UnauthorizedException - 이메일 또는 비밀번호가 올바르지 않을 때
     */
    async loginAdmin(email: string, password: string): Promise<AdminLoginResponseDto> {
        return this.loginAdminUseCase.execute(email, password);
    }

    /**
     * 관리자 토큰 갱신
     *
     * Refresh Token을 검증하고 새로운 Access Token을 발급합니다.
     *
     * @param refreshToken - 리프레시 토큰
     * @returns 새로운 Access Token
     *
     * @throws UnauthorizedException - 리프레시 토큰이 유효하지 않을 때
     */
    async refreshAdminToken(refreshToken: string): Promise<{ accessToken: string }> {
        return this.refreshAdminTokenUseCase.execute(refreshToken);
    }
}
