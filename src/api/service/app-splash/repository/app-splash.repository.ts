import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppSplash, AppSplashDocument } from '../../../../schema/app-splash.schema';
import type { AppSplashPlatform, AppSplashRecord, AppSplashSettings } from '../application/types/app-splash.type';

@Injectable()
export class AppSplashRepository {
    constructor(@InjectModel(AppSplash.name) private readonly model: Model<AppSplashDocument>) {}

    /** 등록되지 않은 플랫폼은 유스케이스가 기본 설정으로 응답한다. */
    async find(platform: AppSplashPlatform): Promise<AppSplashRecord | null> {
        return this.model.findOne({ platform }).lean().exec();
    }

    /** 플랫폼 유니크 인덱스와 원자적 upsert로 설정 중복을 방지한다. */
    async save(platform: AppSplashPlatform, settings: AppSplashSettings): Promise<AppSplashRecord> {
        return this.model
            .findOneAndUpdate(
                { platform },
                { $set: settings },
                {
                    upsert: true,
                    new: true,
                    runValidators: true,
                    setDefaultsOnInsert: true,
                },
            )
            .lean()
            .orFail()
            .exec();
    }
}
