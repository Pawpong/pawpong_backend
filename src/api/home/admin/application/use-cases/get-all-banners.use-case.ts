import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import { BannerResponseDto } from '../../../dto/response/banner-response.dto';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class GetAllBannersUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        private readonly storageService: StorageService,
    ) {}

    async execute(): Promise<BannerResponseDto[]> {
        const banners = await this.homeAdminManager.readAllBanners();

        return this.homeBannerCatalogService.buildResponse(banners, (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        );
    }
}
