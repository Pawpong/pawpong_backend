import { Injectable } from '@nestjs/common';

import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';
import { AppVersionAdminPaginationAssemblerService } from './app-version-admin-pagination-assembler.service';

@Injectable()
export class AppVersionAdminPresentationService {
    constructor(
        private readonly appVersionAdminPaginationAssemblerService: AppVersionAdminPaginationAssemblerService,
    ) {}

    toResponseDto(appVersion: AppVersionAdminSnapshot): AppVersionResponseDto {
        return {
            appVersionId: appVersion.appVersionId,
            platform: appVersion.platform,
            latestVersion: appVersion.latestVersion,
            minRequiredVersion: appVersion.minRequiredVersion,
            forceUpdateMessage: appVersion.forceUpdateMessage,
            recommendUpdateMessage: appVersion.recommendUpdateMessage,
            iosStoreUrl: appVersion.iosStoreUrl,
            androidStoreUrl: appVersion.androidStoreUrl,
            isActive: appVersion.isActive,
            createdAt: appVersion.createdAt.toISOString(),
            updatedAt: appVersion.updatedAt.toISOString(),
        };
    }

    toPaginationResponse(
        items: AppVersionAdminSnapshot[],
        page: number,
        limit: number,
        totalItems: number,
    ): PaginationResponseDto<AppVersionResponseDto> {
        return this.appVersionAdminPaginationAssemblerService.build(
            items.map((item) => this.toResponseDto(item)),
            page,
            limit,
            totalItems,
        );
    }
}
