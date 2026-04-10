import { Inject, Injectable } from '@nestjs/common';

import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL, type HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeBannerCommand } from '../types/home-admin-command.type';
import type { HomeBannerResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class CreateBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(data: HomeBannerCommand): Promise<HomeBannerResult> {
        const banner = await this.homeAdminManager.createBanner(data);

        return this.homeBannerCatalogService.buildResults([banner], (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        )[0];
    }
}
