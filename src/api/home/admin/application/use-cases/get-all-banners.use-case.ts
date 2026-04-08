import { Inject, Injectable } from '@nestjs/common';

import { BannerResponseDto } from '../../../dto/response/banner-response.dto';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL, type HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class GetAllBannersUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(): Promise<BannerResponseDto[]> {
        const banners = await this.homeAdminManager.readAllBanners();

        return this.homeBannerCatalogService.buildResponse(banners, (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
