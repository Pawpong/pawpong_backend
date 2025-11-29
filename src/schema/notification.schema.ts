import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

/**
 * 알림 스키마
 *
 * 사용자(입양자/브리더)에게 전송되는 알림을 관리합니다.
 * - 제목, 내용, 날짜
 * - 읽음/신규 상태 (클릭 여부)
 */
@Schema({
    timestamps: true,
    collection: 'notifications',
})
export class Notification {
    /**
     * 수신자 ID (입양자 또는 브리더)
     */
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, index: true })
    recipientId: MongooseSchema.Types.ObjectId;

    /**
     * 수신자 타입
     * - adopter: 입양자
     * - breeder: 브리더
     */
    @Prop({ required: true, enum: ['adopter', 'breeder'], index: true })
    recipientType: string;

    /**
     * 알림 제목
     */
    @Prop({ required: true })
    title: string;

    /**
     * 알림 내용
     */
    @Prop({ required: true })
    content: string;

    /**
     * 읽음 여부 (클릭 여부)
     * - false: 신규
     * - true: 읽음
     */
    @Prop({ default: false, index: true })
    isRead: boolean;

    /**
     * 알림 타입
     * - profile_review: 프로필 심사
     * - profile_re_review: 프로필 재심사
     * - matching: 매칭
     */
    @Prop({ required: true, enum: ['profile_review', 'profile_re_review', 'matching'], index: true })
    type: string;

    /**
     * 관련 리소스 ID (선택적 - 클릭 시 이동할 대상)
     */
    @Prop({ type: MongooseSchema.Types.ObjectId })
    relatedId?: MongooseSchema.Types.ObjectId;

    /**
     * 관련 리소스 타입 (선택적)
     */
    @Prop()
    relatedType?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// 인덱스 설정
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 }); // 사용자별 신규/읽음 알림 조회
NotificationSchema.index({ recipientId: 1, createdAt: -1 }); // 사용자별 최신 알림 조회
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90일 후 자동 삭제 (TTL)
