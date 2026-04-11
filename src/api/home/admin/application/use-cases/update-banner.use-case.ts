import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL_PORT, type HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';
import { HOME_ADMIN_MANAGER_PORT, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';
import type { HomeBannerUpdateCommand } from '../types/home-admin-command.type';
import type { HomeBannerResult } from '../../../application/types/home-content-result.type';

@Injectable()
export class UpdateBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER_PORT)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL_PORT)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(bannerId: string, data: HomeBannerUpdateCommand): Promise<HomeBannerResult> {
        const banner = await this.homeAdminManager.updateBanner(bannerId, data);

        if (!banner) {
            throw new BadRequestException('배너를 찾을 수 없습니다.');
        }

        return this.homeBannerCatalogService.buildResults([banner], (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        )[0];
    }
}
