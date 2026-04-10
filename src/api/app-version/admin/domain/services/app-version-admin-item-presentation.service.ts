import { Injectable } from '@nestjs/common';

import { AppVersionResponseDto } from '../../../dto/response/app-version-response.dto';
import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';

@Injectable()
export class AppVersionAdminItemPresentationService {
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
}
