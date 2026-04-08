import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BannerResponseDto } from '../../../dto/response/banner-response.dto';
import { BannerUpdateRequestDto } from '../../dto/request/banner-update-request.dto';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ASSET_URL, type HomeAssetUrlPort } from '../../../application/ports/home-asset-url.port';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class UpdateBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        @Inject(HOME_ASSET_URL)
        private readonly homeAssetUrl: HomeAssetUrlPort,
    ) {}

    async execute(bannerId: string, data: BannerUpdateRequestDto): Promise<BannerResponseDto> {
        const banner = await this.homeAdminManager.updateBanner(bannerId, data);

        if (!banner) {
            throw new BadRequestException('배너를 찾을 수 없습니다.');
        }

        return this.homeBannerCatalogService.buildResponse([banner], (fileName, expirationMinutes) =>
            this.homeAssetUrl.generateSignedUrl(fileName, expirationMinutes),
        )[0];
    }
}
