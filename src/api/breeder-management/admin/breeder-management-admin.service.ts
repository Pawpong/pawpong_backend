import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorageService } from '../../../common/storage/storage.service';
import { AuthBanner, AuthBannerDocument } from '../../../schema/auth-banner.schema';
import { CounselBanner, CounselBannerDocument } from '../../../schema/counsel-banner.schema';

import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import { CounselBannerCreateRequestDto } from './dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from './dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';

@Injectable()
export class BreederManagementAdminService {
    constructor(
        @InjectModel(AuthBanner.name) private authBannerModel: Model<AuthBannerDocument>,
        @InjectModel(CounselBanner.name) private counselBannerModel: Model<CounselBannerDocument>,
        private readonly storageService: StorageService,
    ) {}

    // ==================== 프로필 배너 관리 ====================

    /**
     * 모든 프로필 배너 조회 (활성/비활성 모두)
     *
     * @returns 프로필 배너 목록
     */
    async getAllProfileBanners(): Promise<ProfileBannerResponseDto[]> {
        const banners = await this.authBannerModel.find().sort({ bannerType: 1, order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType,
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
        const banners = await this.authBannerModel.find({ isActive: true }).sort({ order: 1 }).lean().exec();

        return banners.map((banner) => ({
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType,
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
        const newBanner = await this.authBannerModel.create(data);

        return {
            bannerId: String(newBanner._id),
            imageUrl: this.storageService.generateSignedUrl(newBanner.imageFileName, 60 * 24),
            imageFileName: newBanner.imageFileName,
            bannerType: newBanner.bannerType,
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
    async updateProfileBanner(
        bannerId: string,
        data: ProfileBannerUpdateRequestDto,
    ): Promise<ProfileBannerResponseDto> {
        const banner = await this.authBannerModel.findByIdAndUpdate(bannerId, data, { new: true }).lean().exec();

        if (!banner) {
            throw new BadRequestException('프로필 배너를 찾을 수 없습니다.');
        }

        return {
            bannerId: banner._id.toString(),
            imageUrl: this.storageService.generateSignedUrl(banner.imageFileName, 60 * 24),
            imageFileName: banner.imageFileName,
            bannerType: banner.bannerType,
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
        const result = await this.authBannerModel.findByIdAndDelete(bannerId).exec();

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
    async updateCounselBanner(
        bannerId: string,
        data: CounselBannerUpdateRequestDto,
    ): Promise<CounselBannerResponseDto> {
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
