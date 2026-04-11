import { Inject, Injectable } from '@nestjs/common';

import { BreederManagementBannerPresentationService } from '../../domain/services/breeder-management-banner-presentation.service';
import {
    BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT,
    type BreederManagementAdminBannerReaderPort,
} from '../ports/breeder-management-admin-banner-reader.port';
import type { BreederManagementCounselBannerResult } from '../types/breeder-management-admin-banner-result.type';

@Injectable()
export class GetActiveCounselBannersUseCase {
    constructor(
        @Inject(BREEDER_MANAGEMENT_ADMIN_BANNER_READER_PORT)
        private readonly bannerReader: BreederManagementAdminBannerReaderPort,
        private readonly breederManagementBannerPresentationService: BreederManagementBannerPresentationService,
    ) {}

    async execute(): Promise<BreederManagementCounselBannerResult[]> {
        const banners = await this.bannerReader.readActiveCounsel();
        return banners.map((banner) => this.breederManagementBannerPresentationService.toCounselResult(banner));
    }
}
