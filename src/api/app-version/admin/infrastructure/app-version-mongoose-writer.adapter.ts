import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppVersion } from '../../../../schema/app-version.schema';
import { AppVersionCreateRequestDto } from '../../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../../dto/request/app-version-update-request.dto';
import { AppVersionAdminSnapshot } from '../application/ports/app-version-admin-reader.port';
import { AppVersionWriterPort } from '../application/ports/app-version-writer.port';

@Injectable()
export class AppVersionMongooseWriterAdapter implements AppVersionWriterPort {
    constructor(@InjectModel(AppVersion.name) private readonly appVersionModel: Model<AppVersion>) {}

    async create(createData: AppVersionCreateRequestDto): Promise<AppVersionAdminSnapshot> {
        const appVersion = new this.appVersionModel({
            ...createData,
            isActive: createData.isActive ?? true,
        });

        await appVersion.save();
        return this.toSnapshot(appVersion);
    }

    async update(
        appVersionId: string,
        updateData: AppVersionUpdateRequestDto,
    ): Promise<AppVersionAdminSnapshot | null> {
        const appVersion = await this.appVersionModel.findById(appVersionId).exec();

        if (!appVersion) {
            return null;
        }

        if (updateData.latestVersion !== undefined) appVersion.latestVersion = updateData.latestVersion;
        if (updateData.minRequiredVersion !== undefined) appVersion.minRequiredVersion = updateData.minRequiredVersion;
        if (updateData.forceUpdateMessage !== undefined) appVersion.forceUpdateMessage = updateData.forceUpdateMessage;
        if (updateData.recommendUpdateMessage !== undefined) {
            appVersion.recommendUpdateMessage = updateData.recommendUpdateMessage;
        }
        if (updateData.iosStoreUrl !== undefined) appVersion.iosStoreUrl = updateData.iosStoreUrl;
        if (updateData.androidStoreUrl !== undefined) appVersion.androidStoreUrl = updateData.androidStoreUrl;
        if (updateData.isActive !== undefined) appVersion.isActive = updateData.isActive;

        await appVersion.save();
        return this.toSnapshot(appVersion);
    }

    async delete(appVersionId: string): Promise<boolean> {
        const deleted = await this.appVersionModel.findByIdAndDelete(appVersionId).exec();
        return !!deleted;
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
