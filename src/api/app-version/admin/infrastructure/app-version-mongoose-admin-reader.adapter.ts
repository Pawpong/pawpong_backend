import { Injectable } from '@nestjs/common';

import { AppVersion } from '../../../../schema/app-version.schema';
import {
    AppVersionAdminPage,
    AppVersionAdminReaderPort,
    AppVersionAdminSnapshot,
} from '../application/ports/app-version-admin-reader.port';
import { AppVersionRepository } from '../../repository/app-version.repository';

@Injectable()
export class AppVersionMongooseAdminReaderAdapter implements AppVersionAdminReaderPort {
    constructor(private readonly appVersionRepository: AppVersionRepository) {}

    async readPage(page: number, limit: number): Promise<AppVersionAdminPage> {
        const skip = (page - 1) * limit;
        const [totalItems, versions] = await Promise.all([
            this.appVersionRepository.countAll(),
            this.appVersionRepository.findPage(skip, limit),
        ]);

        return {
            items: versions.map((version) => this.toSnapshot(version)),
            totalItems,
        };
    }

    private toSnapshot(version: AppVersion): AppVersionAdminSnapshot {
        return {
            appVersionId: version._id.toString(),
            platform: version.platform,
            latestVersion: version.latestVersion,
            minRequiredVersion: version.minRequiredVersion,
            forceUpdateMessage: version.forceUpdateMessage,
            recommendUpdateMessage: version.recommendUpdateMessage,
            iosStoreUrl: version.iosStoreUrl,
            androidStoreUrl: version.androidStoreUrl,
            isActive: version.isActive,
            createdAt: version.createdAt,
            updatedAt: version.updatedAt,
        };
    }
}
