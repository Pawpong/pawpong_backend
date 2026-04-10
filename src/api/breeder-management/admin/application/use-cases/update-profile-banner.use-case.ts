import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ProfileBannerResponseDto } from '../../dto/response/profile-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';
import type { BreederManagementProfileBannerUpdateCommand } from '../types/breeder-management-admin-banner-command.type';

@Injectable()
export class UpdateProfileBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(
        bannerId: string,
        data: BreederManagementProfileBannerUpdateCommand,
    ): Promise<ProfileBannerResponseDto> {
        const banner = await this.bannerWriter.updateProfile(bannerId, data);

        if (!banner) {
            throw new BadRequestException('프로필 배너를 찾을 수 없습니다.');
        }

        return this.breederManagementBannerPresentationService.toProfileResponseDto(banner);
    }
}
