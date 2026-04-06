import { Injectable } from '@nestjs/common';

import { PaginationBuilder } from '../../../../../common/dto/pagination/pagination-builder.dto';
import { PaginationResponseDto } from '../../../../../common/dto/pagination/pagination-response.dto';
import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';

@Injectable()
export class AppVersionAdminPresentationService {
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
        return new PaginationBuilder<AppVersionResponseDto>()
            .setItems(items.map((item) => this.toResponseDto(item)))
            .setPage(page)
            .setLimit(limit)
            .setTotalCount(totalItems)
            .build();
    }
}
