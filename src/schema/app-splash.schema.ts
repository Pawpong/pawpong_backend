import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import type { AppSplashPlatform } from '../api/service/app-splash/application/types/app-splash.type';
import { APP_SPLASH_DEFAULTS, APP_SPLASH_PLATFORMS } from '../api/service/app-splash/constants/app-splash.constants';

/** 이미지 URL 대신 스토리지 파일키를 보관하여 CDN 변경과 파일 정리를 지원한다. */
@Schema({ collection: 'app_splashes', timestamps: true })
export class AppSplash {
    @Prop({ type: String, enum: APP_SPLASH_PLATFORMS, required: true, unique: true })
    platform: AppSplashPlatform;

    @Prop({ default: APP_SPLASH_DEFAULTS.isEnabled })
    isEnabled: boolean;

    @Prop({ default: '' })
    imageFileName: string;

    @Prop({ default: APP_SPLASH_DEFAULTS.backgroundColor })
    backgroundColor: string;

    @Prop({ default: APP_SPLASH_DEFAULTS.imageWidth, min: 80, max: 320 })
    imageWidth: number;

    @Prop({ default: APP_SPLASH_DEFAULTS.durationMs, min: 0, max: 3000 })
    durationMs: number;

    updatedAt: Date;
}
export type AppSplashDocument = HydratedDocument<AppSplash>;
export const AppSplashSchema = SchemaFactory.createForClass(AppSplash);
