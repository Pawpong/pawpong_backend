import { Injectable } from '@nestjs/common';

import { ProfileBannerCreateRequestDto } from './dto/request/profile-banner-create-request.dto';
import { ProfileBannerUpdateRequestDto } from './dto/request/profile-banner-update-request.dto';
import { ProfileBannerResponseDto } from './dto/response/profile-banner-response.dto';
import { CounselBannerCreateRequestDto } from './dto/request/counsel-banner-create-request.dto';
import { CounselBannerUpdateRequestDto } from './dto/request/counsel-banner-update-request.dto';
import { CounselBannerResponseDto } from './dto/response/counsel-banner-response.dto';
import { GetAllProfileBannersUseCase } from './application/use-cases/get-all-profile-banners.use-case';
import { GetActiveProfileBannersUseCase } from './application/use-cases/get-active-profile-banners.use-case';
import { CreateProfileBannerUseCase } from './application/use-cases/create-profile-banner.use-case';
import { UpdateProfileBannerUseCase } from './application/use-cases/update-profile-banner.use-case';
import { DeleteProfileBannerUseCase } from './application/use-cases/delete-profile-banner.use-case';
import { GetAllCounselBannersUseCase } from './application/use-cases/get-all-counsel-banners.use-case';
import { GetActiveCounselBannersUseCase } from './application/use-cases/get-active-counsel-banners.use-case';
import { CreateCounselBannerUseCase } from './application/use-cases/create-counsel-banner.use-case';
import { UpdateCounselBannerUseCase } from './application/use-cases/update-counsel-banner.use-case';
import { DeleteCounselBannerUseCase } from './application/use-cases/delete-counsel-banner.use-case';

@Injectable()
export class BreederManagementAdminService {
    constructor(
        private readonly getAllProfileBannersUseCase: GetAllProfileBannersUseCase,
        private readonly getActiveProfileBannersUseCase: GetActiveProfileBannersUseCase,
        private readonly createProfileBannerUseCase: CreateProfileBannerUseCase,
        private readonly updateProfileBannerUseCase: UpdateProfileBannerUseCase,
        private readonly deleteProfileBannerUseCase: DeleteProfileBannerUseCase,
        private readonly getAllCounselBannersUseCase: GetAllCounselBannersUseCase,
        private readonly getActiveCounselBannersUseCase: GetActiveCounselBannersUseCase,
        private readonly createCounselBannerUseCase: CreateCounselBannerUseCase,
        private readonly updateCounselBannerUseCase: UpdateCounselBannerUseCase,
        private readonly deleteCounselBannerUseCase: DeleteCounselBannerUseCase,
    ) {}

    // ==================== 프로필 배너 관리 ====================

    /**
     * 모든 프로필 배너 조회 (활성/비활성 모두)
     *
     * @returns 프로필 배너 목록
     */
    async getAllProfileBanners(): Promise<ProfileBannerResponseDto[]> {
        return this.getAllProfileBannersUseCase.execute();
    }

    /**
     * 활성화된 프로필 배너만 조회 (프로필 페이지 표시용)
     *
     * @param bannerType 배너 타입 (login 또는 signup), 없으면 전체
     * @returns 활성화된 프로필 배너 목록
     */
    async getActiveProfileBanners(bannerType?: 'login' | 'signup'): Promise<ProfileBannerResponseDto[]> {
        return this.getActiveProfileBannersUseCase.execute(bannerType);
    }

    /**
     * 프로필 배너 생성
     *
     * @param data 배너 생성 데이터
     * @returns 생성된 배너 정보
     */
    async createProfileBanner(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerResponseDto> {
        return this.createProfileBannerUseCase.execute(data);
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
        return this.updateProfileBannerUseCase.execute(bannerId, data);
    }

    /**
     * 프로필 배너 삭제
     *
     * @param bannerId 배너 고유 ID
     */
    async deleteProfileBanner(bannerId: string): Promise<void> {
        return this.deleteProfileBannerUseCase.execute(bannerId);
    }

    // ==================== 상담 배너 관리 ====================

    /**
     * 모든 상담 배너 조회 (활성/비활성 모두)
     *
     * @returns 상담 배너 목록
     */
    async getAllCounselBanners(): Promise<CounselBannerResponseDto[]> {
        return this.getAllCounselBannersUseCase.execute();
    }

    /**
     * 활성화된 상담 배너만 조회 (상담 신청 페이지 표시용)
     *
     * @returns 활성화된 상담 배너 목록
     */
    async getActiveCounselBanners(): Promise<CounselBannerResponseDto[]> {
        return this.getActiveCounselBannersUseCase.execute();
    }

    /**
     * 상담 배너 생성
     *
     * @param data 배너 생성 데이터
     * @returns 생성된 배너 정보
     */
    async createCounselBanner(data: CounselBannerCreateRequestDto): Promise<CounselBannerResponseDto> {
        return this.createCounselBannerUseCase.execute(data);
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
        return this.updateCounselBannerUseCase.execute(bannerId, data);
    }

    /**
     * 상담 배너 삭제
     *
     * @param bannerId 배너 고유 ID
     */
    async deleteCounselBanner(bannerId: string): Promise<void> {
        return this.deleteCounselBannerUseCase.execute(bannerId);
    }
}
