import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppVersion } from '../../../../schema/app-version.schema';
import { AppVersionAdminPage, AppVersionAdminReaderPort, AppVersionAdminSnapshot } from '../application/ports/app-version-admin-reader.port';

@Injectable()
export class AppVersionMongooseAdminReaderAdapter implements AppVersionAdminReaderPort {
    constructor(@InjectModel(AppVersion.name) private readonly appVersionModel: Model<AppVersion>) {}

    async readPage(page: number, limit: number): Promise<AppVersionAdminPage> {
        const skip = (page - 1) * limit;
        const totalItems = await this.appVersionModel.countDocuments();
        const versions = await this.appVersionModel
            .find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        return {
            items: versions.map((version) => this.toSnapshot(version)),
            totalItems,
        };
    }

    private toSnapshot(version: any): AppVersionAdminSnapshot {
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
