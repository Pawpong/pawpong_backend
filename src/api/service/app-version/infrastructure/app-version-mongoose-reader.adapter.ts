import { Injectable } from '@nestjs/common';

import { AppVersionReaderPort, ActiveAppVersionSnapshot } from '../application/ports/app-version-reader.port';
import { AppVersionRepository } from '../repository/app-version.repository';

@Injectable()
export class AppVersionMongooseReaderAdapter implements AppVersionReaderPort {
    constructor(private readonly appVersionRepository: AppVersionRepository) {}

    async findLatestActiveByPlatform(platform: 'ios' | 'android'): Promise<ActiveAppVersionSnapshot | null> {
        const versionInfo = await this.appVersionRepository.findLatestActiveByPlatform(platform);

        if (!versionInfo) {
            return null;
        }

        return {
            latestVersion: versionInfo.latestVersion,
            minRequiredVersion: versionInfo.minRequiredVersion,
            forceUpdateMessage: versionInfo.forceUpdateMessage,
            recommendUpdateMessage: versionInfo.recommendUpdateMessage,
            iosStoreUrl: versionInfo.iosStoreUrl,
            androidStoreUrl: versionInfo.androidStoreUrl,
        };
    }
}
