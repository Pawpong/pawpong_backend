import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { CustomLoggerService } from '../../../common/logger/custom-logger.service';
import { StorageService } from '../../../common/storage/storage.service';

import { AuthAdminRepository } from '../repository/auth-admin.repository';

import { AdminLoginResponseDto } from '../dto/response/admin-login-response.dto';
import { ProfileBanner, ProfileBannerDocument } from '../../../schema/profile-banner.schema';
import { CounselBanner, CounselBannerDocument } from '../../../schema/counsel-banner.schema';
import { ProfileBannerCreateRequestDto } from '../../breeder-management/admin/dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from '../../breeder-management/admin/dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from '../../breeder-management/admin/dto/response/profile-banner-response.dto';
import { CounselBannerCreateRequestDto } from '../../breeder-management/admin/dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from '../../breeder-management/admin/dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from '../../breeder-management/admin/dto/response/counsel-banner-response.dto';

/**
 * 관리자 인증 서비스
 *
 * 관리자 로그인, JWT 토큰 생성, 배너 관리 등 관리자 관련 비즈니스 로직을 처리합니다.
 */
@Injectable()
export class AuthAdminService {
    constructor(
        private readonly logger: CustomLoggerService,
        private readonly jwtService: JwtService,
        private readonly authAdminRepository: AuthAdminRepository,
        private readonly storageService: StorageService,
        @InjectModel(ProfileBanner.name) private profileBannerModel: Model<ProfileBannerDocument>,
        @InjectModel(CounselBanner.name) private counselBannerModel: Model<CounselBannerDocument>,
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

    // ==================== 프로필 배너 관리 ====================

    /**
     * 모든 프로필 배너 조회 (활성/비활성 모두)
     *
     * @returns 프로필 배너 목록
     */
    async getAllProfileBanners(): Promise<ProfileBannerResponseDto[]> {
        const banners = await this.profileBannerModel.find().sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        }));
    }

    /**
     * 활성화된 프로필 배너만 조회 (프로필 페이지 표시용)
     *
     * @returns 활성화된 프로필 배너 목록
     */
    async getActiveProfileBanners(): Promise<ProfileBannerResponseDto[]> {
        const banners = await this.profileBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        }));
    }

    /**
     * 프로필 배너 생성
     *
     * @param data 배너 생성 데이터
     * @returns 생성된 배너 정보
     */
    async createProfileBanner(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerResponseDto> {
        const newBanner = await this.profileBannerModel.create(data);

        return {
            bannerId: String(newBanner._id),
            imageUrl: this.storageService.generateSignedUrl(newBanner.imageFileName, 60 * 24),
            imageFileName: newBanner.imageFileName,
            linkType: newBanner.linkType,
            linkUrl: newBanner.linkUrl,
            title: newBanner.title,
            description: newBanner.description,
            order: newBanner.order,
            isActive: newBanner.isActive !== false,
        };
    }

    /**
     * 프로필 배너 수정
     *
     * @param bannerId 배너 고유 ID
     * @param data 배너 수정 데이터
     * @returns 수정된 배너 정보
     */
    async updateProfileBanner(bannerId: string, data: ProfileBannerUpdateRequestDto): Promise<ProfileBannerResponseDto> {
        const banner = await this.profileBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();

        if (!banner) {
            throw new BadRequestException('프로필 배너를 찾을 수 없습니다.');
        }

        return {
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }

    /**
     * 프로필 배너 삭제
     *
     * @param bannerId 배너 고유 ID
     */
    async deleteProfileBanner(bannerId: string): Promise<void> {
        const result = await this.profileBannerModel.findByIdAndDelete(bannerId).exec();

        if (!result) {
            throw new BadRequestException('프로필 배너를 찾을 수 없습니다.');
        }
    }

    // ==================== 상담 배너 관리 ====================

    /**
     * 모든 상담 배너 조회 (활성/비활성 모두)
     *
     * @returns 상담 배너 목록
     */
    async getAllCounselBanners(): Promise<CounselBannerResponseDto[]> {
        const banners = await this.counselBannerModel.find().sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        }));
    }

    /**
     * 활성화된 상담 배너만 조회 (상담 신청 페이지 표시용)
     *
     * @returns 활성화된 상담 배너 목록
     */
    async getActiveCounselBanners(): Promise<CounselBannerResponseDto[]> {
        const banners = await this.counselBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        }));
    }

    /**
     * 상담 배너 생성
     *
     * @param data 배너 생성 데이터
     * @returns 생성된 배너 정보
     */
    async createCounselBanner(data: CounselBannerCreateRequestDto): Promise<CounselBannerResponseDto> {
        const newBanner = await this.counselBannerModel.create(data);

        return {
            bannerId: String(newBanner._id),
            imageUrl: this.storageService.generateSignedUrl(newBanner.imageFileName, 60 * 24),
            imageFileName: newBanner.imageFileName,
            linkType: newBanner.linkType,
            linkUrl: newBanner.linkUrl,
            title: newBanner.title,
            description: newBanner.description,
            order: newBanner.order,
            isActive: newBanner.isActive !== false,
        };
    }

    /**
     * 상담 배너 수정
     *
     * @param bannerId 배너 고유 ID
     * @param data 배너 수정 데이터
     * @returns 수정된 배너 정보
     */
    async updateCounselBanner(bannerId: string, data: CounselBannerUpdateRequestDto): Promise<CounselBannerResponseDto> {
        const banner = await this.counselBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();

        if (!banner) {
            throw new BadRequestException('상담 배너를 찾을 수 없습니다.');
        }

        return {
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            linkType: banner.linkType,
            linkUrl: banner.linkUrl,
            title: banner.title,
            description: banner.description,
            order: banner.order,
            isActive: banner.isActive !== false,
        };
    }

    /**
     * 상담 배너 삭제
     *
     * @param bannerId 배너 고유 ID
     */
    async deleteCounselBanner(bannerId: string): Promise<void> {
        const result = await this.counselBannerModel.findByIdAndDelete(bannerId).exec();

        if (!result) {
            throw new BadRequestException('상담 배너를 찾을 수 없습니다.');
        }
    }
}
