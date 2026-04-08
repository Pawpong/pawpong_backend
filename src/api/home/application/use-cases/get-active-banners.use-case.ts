import { Inject, Injectable } from '@nestjs/common';

import { BannerResponseDto } from '../../dto/response/banner-response.dto';
import { HomeBannerCatalogService } from '../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL, type HomeAssetUrlPort } from '../ports/home-asset-url.port';
import { HOME_CONTENT_READER, type HomeContentReaderPort } from '../ports/home-content-reader.port';

@Injectable()
export class GetActiveBannersUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(): Promise<BannerResponseDto[]> {
        const banners = await this.homeContentReader.readActiveBanners();

        return this.homeBannerCatalogService.buildResponse(banners, (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
