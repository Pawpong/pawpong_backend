import { Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import { BannerResponseDto } from '../../../dto/response/banner-response.dto';
import { BannerCreateRequestDto } from '../../dto/request/banner-create-request.dto';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class CreateBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        private readonly storageService: StorageService,
    ) {}

    async execute(data: BannerCreateRequestDto): Promise<BannerResponseDto> {
        const banner = await this.homeAdminManager.createBanner(data);

        return this.homeBannerCatalogService.buildResponse([banner], (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        )[0];
    }
}
