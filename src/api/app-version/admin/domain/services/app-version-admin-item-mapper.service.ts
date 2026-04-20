import { Injectable } from '@nestjs/common';

import { AppVersionAdminSnapshot } from '../../application/ports/app-version-admin-reader.port';
import type { AppVersionAdminItemResult } from '../../application/types/app-version-query.type';

@Injectable()
export class AppVersionAdminItemMapperService {
    toResult(appVersion: AppVersionAdminSnapshot): AppVersionAdminItemResult {
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
