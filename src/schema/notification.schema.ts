import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType } from '../common/enum/user.enum';
import type { NotificationMetadata } from '../api/notification/types/notification-metadata.type';

/**
 * 알림 스키마
 */
@Schema({ collection: 'notifications', timestamps: true })
export class Notification extends Document {
    /**
     * 알림을 받을 사용자 ID
     */
    @Prop({ required: true, index: true })
    userId: string;

    /**
     * 사용자 역할 (adopter | breeder)
     */
    @Prop({ required: true, enum: ['adopter', 'breeder'] })
    userRole: string;

    /**
     * 알림 타입
     */
    @Prop({ required: true, type: String, enum: Object.values(NotificationType) })
    type: NotificationType;

    /**
     * 알림 제목 (타입별 고정 메시지 또는 동적 생성)
     */
    @Prop({ required: true })
    title: string;

    /**
     * 알림 내용 (타입별 고정 메시지 또는 동적 생성)
     */
    @Prop({ required: true })
    body: string;

    /**
     * 동적 데이터 (예: 브리더명, 반려동물명 등)
     */
    @Prop({ type: Object })
    metadata?: NotificationMetadata;

    /**
     * 읽음 여부
     */
    @Prop({ default: false, index: true })
    isRead: boolean;

    /**
     * 읽은 시각
     */
    @Prop()
    readAt?: Date;

    /**
     * 클릭 시 이동할 URL (옵션)
     */
    @Prop()
    targetUrl?: string;

    /**
     * 생성 일시
     */
    createdAt: Date;

    /**
     * 수정 일시
     */
    updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// 복합 인덱스 설정
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
