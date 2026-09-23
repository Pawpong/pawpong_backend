import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppVersion } from '../../../../schema/app-version.schema';
import {
    type AppVersionCreateCommand,
    type AppVersionUpdateCommand,
} from '../../../admin/app-version/application/types/app-version-command.type';

@Injectable()
export class AppVersionRepository {
    constructor(@InjectModel(AppVersion.name) private readonly appVersionModel: Model<AppVersion>) {}

    /** 부분 수정 전에 저장된 버전 정책을 조회한다. */
    findById(appVersionId: string): Promise<AppVersion | null> {
        return this.appVersionModel.findById(appVersionId).exec();
    }

    findLatestActiveByPlatform(platform: 'ios' | 'android'): Promise<AppVersion | null> {
        return this.appVersionModel.findOne({ platform, isActive: true }).sort({ createdAt: -1 }).exec();
    }

    countAll(): Promise<number> {
        return this.appVersionModel.countDocuments().exec();
    }

    findPage(skip: number, limit: number): Promise<AppVersion[]> {
        return this.appVersionModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    }

    async create(createData: AppVersionCreateCommand): Promise<AppVersion> {
        const appVersion = new this.appVersionModel({
            ...createData,
            isActive: createData.isActive ?? true,
        });

        return appVersion.save();
    }

    async update(appVersionId: string, updateData: AppVersionUpdateCommand): Promise<AppVersion | null> {
        // 유스케이스에서 병합·검증한 버전 쌍을 한 번에 저장한다.
        const values = Object.fromEntries(Object.entries(updateData).filter(([, value]) => value !== undefined));
        return this.appVersionModel
            .findByIdAndUpdate(appVersionId, { $set: values }, { new: true, runValidators: true })
            .exec();
    }

    async deleteById(appVersionId: string): Promise<boolean> {
        const deleted = await this.appVersionModel.findByIdAndDelete(appVersionId).exec();
        return !!deleted;
    }
}
