import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * 앱 버전 관리 스키마
 * iOS/Android 앱의 강제/권장 업데이트 버전 정보를 저장
 */
@Schema({
    collection: 'app_versions',
    timestamps: true, // createdAt, updatedAt 자동 생성
})
export class AppVersion extends Document {
    /**
     * 앱 버전 고유 ID (MongoDB 자동 생성)
     */
    declare _id: Types.ObjectId;

    /**
     * 플랫폼 구분
     * - ios: Apple App Store
     * - android: Google Play Store
     */
    @Prop({
        type: String,
        enum: ['ios', 'android'],
        required: true,
    })
    platform: 'ios' | 'android';

    /**
     * 최신 버전 (예: "1.2.0")
     */
    @Prop({ required: true, trim: true })
    latestVersion: string;

    /**
     * 최소 요구 버전 - 이 버전 미만은 강제 업데이트 (예: "1.0.0")
     */
    @Prop({ required: true, trim: true })
    minRequiredVersion: string;

    /**
     * 강제 업데이트 메시지 (앱 사용 불가, 반드시 업데이트 필요)
     */
    @Prop({ required: true })
    forceUpdateMessage: string;

    /**
     * 권장 업데이트 메시지 (닫기 가능, 나중에 하기 선택 가능)
     */
    @Prop({ required: true })
    recommendUpdateMessage: string;

    /**
     * iOS App Store URL
     */
    @Prop({ required: true })
    iosStoreUrl: string;

    /**
     * Google Play Store URL
     */
    @Prop({ required: true })
    androidStoreUrl: string;

    /**
     * 활성화 여부 (false면 버전 체크에서 제외)
     */
    @Prop({ default: true })
    isActive: boolean;

    /**
     * 생성일
     */
    createdAt: Date;

    /**
     * 수정일
     */
    updatedAt: Date;
}

export const AppVersionSchema = SchemaFactory.createForClass(AppVersion);

// 인덱스 설정
AppVersionSchema.index({ platform: 1, isActive: 1 }); // 플랫폼별 활성 버전 조회
AppVersionSchema.index({ platform: 1, createdAt: -1 }); // 플랫폼별 최신순 조회
