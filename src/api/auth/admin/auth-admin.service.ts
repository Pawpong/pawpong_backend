import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { AuthAdminRepository } from '../repository/auth-admin.repository';

import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';
import * as bcrypt from 'bcryptjs';

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
        private readonly logger: CustomLoggerService,
        private readonly jwtService: JwtService,
        private readonly authAdminRepository: AuthAdminRepository,
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
        this.logger.logStart('loginAdmin', '관리자 로그인 시작', { email });

        // 활성 상태인 관리자 조회
        const admin = await this.authAdminRepository.findActiveByEmail(email);

        if (!admin) {
            this.logger.logError('loginAdmin', '관리자 조회 실패', new Error('관리자를 찾을 수 없습니다'));
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 비밀번호 검증
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            this.logger.logError('loginAdmin', '비밀번호 불일치', new Error('비밀번호가 올바르지 않습니다'));
            throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
        }

        // 마지막 로그인 시간 업데이트
        const adminId = (admin as any)._id.toString();
        await this.authAdminRepository.updateLastLogin(adminId);

        // JWT 토큰 생성
        const payload = {
            sub: adminId,
            email: admin.email,
            role: 'admin',
            adminLevel: admin.adminLevel,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: '1h',
        });

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });

        this.logger.logSuccess('loginAdmin', '관리자 로그인 성공', {
            adminId,
            email: admin.email,
            adminLevel: admin.adminLevel,
        });

        return {
            adminId,
            email: admin.email,
            name: admin.name,
            adminLevel: admin.adminLevel,
            permissions: admin.permissions,
            accessToken,
            refreshToken,
        };
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
        this.logger.logStart('refreshAdminToken', '관리자 토큰 갱신 시작');

        try {
            // Refresh Token 검증
            const payload = this.jwtService.verify(refreshToken);

            // 관리자 정보 확인 (role이 admin인지 검증)
            if (payload.role !== 'admin') {
                this.logger.logError('refreshAdminToken', '관리자 권한 없음', new Error('관리자 토큰이 아닙니다'));
                throw new UnauthorizedException('유효하지 않은 토큰입니다.');
            }

            // 관리자가 여전히 활성 상태인지 확인
            const admin = await this.authAdminRepository.findActiveByEmail(payload.email);

            if (!admin) {
                this.logger.logError('refreshAdminToken', '관리자 조회 실패', new Error('관리자를 찾을 수 없습니다'));
                throw new UnauthorizedException('유효하지 않은 토큰입니다.');
            }

            // 새로운 Access Token 생성
            const newPayload = {
                sub: payload.sub,
                email: payload.email,
                role: payload.role,
                adminLevel: payload.adminLevel,
            };

            const accessToken = this.jwtService.sign(newPayload, {
                expiresIn: '1h',
            });

            this.logger.logSuccess('refreshAdminToken', '관리자 토큰 갱신 성공', {
                adminId: payload.sub,
                email: payload.email,
            });

            return { accessToken };
        } catch (error) {
            this.logger.logError('refreshAdminToken', '토큰 갱신 실패', error);
            throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
}
