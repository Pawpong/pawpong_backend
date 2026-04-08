import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppVersion } from '../../../schema/app-version.schema';
import { AppVersionCreateRequestDto } from '../dto/request/app-version-create-request.dto';
import { AppVersionUpdateRequestDto } from '../dto/request/app-version-update-request.dto';

@Injectable()
export class AppVersionRepository {
    constructor(@InjectModel(AppVersion.name) private readonly appVersionModel: Model<AppVersion>) {}

    findLatestActiveByPlatform(platform: 'ios' | 'android'): Promise<AppVersion | null> {
        return this.appVersionModel.findOne({ platform, isActive: true }).sort({ createdAt: -1 }).exec();
    }

    countAll(): Promise<number> {
        return this.appVersionModel.countDocuments().exec();
    }

    findPage(skip: number, limit: number): Promise<AppVersion[]> {
        return this.appVersionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }

    async create(createData: AppVersionCreateRequestDto): Promise<AppVersion> {
        const appVersion = new this.appVersionModel({
            ...createData,
            isActive: createData.isActive ?? true,
        });

        return appVersion.save();
    }

    async update(appVersionId: string, updateData: AppVersionUpdateRequestDto): Promise<AppVersion | null> {
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

        return appVersion.save();
    }

    async deleteById(appVersionId: string): Promise<boolean> {
        const deleted = await this.appVersionModel.findByIdAndDelete(appVersionId).exec();
        return !!deleted;
    }
}
