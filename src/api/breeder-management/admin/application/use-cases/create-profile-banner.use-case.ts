import { Inject, Injectable } from '@nestjs/common';

import { ProfileBannerCreateRequestDto } from '../../dto/request/profile-banner-create-request.dto';
import { ProfileBannerResponseDto } from '../../dto/response/profile-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER,
    type BreederManagementAdminBannerWriterPort,
} from '../ports/breeder-management-admin-banner-writer.port';

@Injectable()
export class CreateProfileBannerUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_WRITER)
        private readonly bannerWriter: BreederManagementAdminBannerWriterPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(data: ProfileBannerCreateRequestDto): Promise<ProfileBannerResponseDto> {
        const banner = await this.bannerWriter.createProfile(data);
        return this.breederManagementBannerPresentationService.toProfileResponseDto(banner);
    }
}
