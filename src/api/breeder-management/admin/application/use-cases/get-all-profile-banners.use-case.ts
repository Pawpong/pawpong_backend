import { Inject, Injectable } from '@nestjs/common';

import { ProfileBannerResponseDto } from '../../dto/response/profile-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_READER,
    type BreederManagementAdminBannerReaderPort,
} from '../ports/breeder-management-admin-banner-reader.port';

@Injectable()
export class GetAllProfileBannersUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_READER)
        private readonly bannerReader: BreederManagementAdminBannerReaderPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(): Promise<ProfileBannerResponseDto[]> {
        const banners = await this.bannerReader.readAllProfile();
        return banners.map((banner) => this.breederManagementBannerPresentationService.toProfileResponseDto(banner));
    }
}
