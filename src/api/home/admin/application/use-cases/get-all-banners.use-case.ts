import { Inject, Injectable } from '@nestjs/common';

import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL_PORT, type HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';
import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeBannerResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class GetAllBannersUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL_PORT)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(): Promise<HomeBannerResult[]> {
        const banners = await this.homeAdminManager.readAllBanners();

        return this.homeBannerCatalogService.buildResults(banners, (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
