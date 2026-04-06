import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { StorageService } from '../../../../../common/storage/storage.service';
import { BannerResponseDto } from '../../../dto/response/banner-response.dto';
import { BannerUpdateRequestDto } from '../../dto/request/banner-update-request.dto';
import { HomeBannerCatalogService } from '../../../domain/services/home-banner-catalog.service';
import { HOME_ADMIN_MANAGER, type HomeAdminManagerPort } from '../ports/home-admin-manager.port';

@Injectable()
export class UpdateBannerUseCase {
    constructor(
        @Inject(HOME_ADMIN_MANAGER)
        private readonly homeAdminManager: HomeAdminManagerPort,
        private readonly homeBannerCatalogService: HomeBannerCatalogService,
        private readonly storageService: StorageService,
    ) {}

    async execute(bannerId: string, data: BannerUpdateRequestDto): Promise<BannerResponseDto> {
        const banner = await this.homeAdminManager.updateBanner(bannerId, data);

        if (!banner) {
            throw new BadRequestException('배너를 찾을 수 없습니다.');
        }

        return this.homeBannerCatalogService.buildResponse([banner], (fileName, expirationMinutes) =>
            this.storageService.generateSignedUrl(fileName, expirationMinutes),
        )[0];
    }
}
