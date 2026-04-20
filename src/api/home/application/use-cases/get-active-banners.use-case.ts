import { Inject, Injectable } from '@nestjs/common';

import { HomeBannerCatalogService } from '../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL_PORT, type HomeAssetUrlPort } from '../ports/home-asset-url.port';
import { HOME_CONTENT_READER_PORT, type HomeContentReaderPort } from '../ports/home-content-reader.port';
import type { HomeBannerResult } from '../types/home-content-result.type';

@Injectable()
export class GetActiveBannersUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER_PORT)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL_PORT)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(): Promise<HomeBannerResult[]> {
        const banners = await this.homeContentReader.readActiveBanners();

        return this.homeBannerCatalogService.buildResults(banners, (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
