import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppVersion } from '../../../schema/app-version.schema';
import { AppVersionReaderPort, ActiveAppVersionSnapshot } from '../application/ports/app-version-reader.port';

@Injectable()
export class AppVersionMongooseReaderAdapter implements AppVersionReaderPort {
    constructor(@InjectModel(AppVersion.name) private readonly appVersionModel: Model<AppVersion>) {}

    async findLatestActiveByPlatform(platform: 'ios' | 'android'): Promise<ActiveAppVersionSnapshot | null> {
        const versionInfo = await this.appVersionModel
            .findOne({ platform, isActive: true })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

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
