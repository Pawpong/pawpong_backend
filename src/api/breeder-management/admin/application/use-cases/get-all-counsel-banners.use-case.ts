import { Inject, Injectable } from '@nestjs/common';

import { CounselBannerResponseDto } from '../../dto/response/counsel-banner-response.dto';
import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_READER,
    type BreederManagementAdminBannerReaderPort,
} from '../ports/breeder-management-admin-banner-reader.port';

@Injectable()
export class GetAllCounselBannersUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_READER)
        private readonly bannerReader: BreederManagementAdminBannerReaderPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(): Promise<CounselBannerResponseDto[]> {
        const banners = await this.bannerReader.readAllCounsel();
        return banners.map((banner) => this.breederManagementBannerPresentationService.toCounselResponseDto(banner));
    }
}
