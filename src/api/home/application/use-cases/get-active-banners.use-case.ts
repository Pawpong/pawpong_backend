import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../common/storage/storage.service';
import { BannerResponseDto } from '../../dto/response/banner-response.dto';
import { HomeBannerCatalogService } from '../../domain/services/home-banner-catalog.service';
import { HOME_CONTENT_READER, type HomeContentReaderPort } from '../ports/home-content-reader.port';

@Injectable()
export class GetActiveBannersUseCase {
    constructor(
        @Inject(HOME_CONTENT_READER)
        private readonly homeContentReader: HomeContentReaderPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        private readonly storageService: StorageService,
    ) {}

    async execute(): Promise<BannerResponseDto[]> {
        const banners = await this.homeContentReader.readActiveBanners();

        return this.homeBannerCatalogService.buildResponse(banners, (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
