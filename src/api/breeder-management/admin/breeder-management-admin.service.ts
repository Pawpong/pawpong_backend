import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StorageService } from '../../../common/storage/storage.service';
import { ProfileBanner, ProfileBannerDocument } from '../../../schema/profile-banner.schema';

import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';

@Injectable()
export class BreederManagementAdminService {
    constructor(
        @InjectModel(ProfileBanner.name) private profileBannerModel: Model<ProfileBannerDocument>,
        private readonly storageService: StorageService,
    ) {}

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
    async updateProfileBanner(
        bannerId: string,
        data: ProfileBannerUpdateRequestDto,
    ): Promise<ProfileBannerResponseDto> {
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
}
