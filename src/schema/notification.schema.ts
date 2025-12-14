import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * 알림 타입 정의
 * 각 타입별로 고정된 메시지가 백엔드에서 관리됩니다
 */
export enum NotificationType {
    /** 브리더 승인됨 */
    BREEDER_APPROVED = 'breeder_approved',
    /** 브리더 반려됨 */
    BREEDER_UNAPPROVED = 'breeder_unapproved',
    /** 브리더 온보딩 미완료 */
    BREEDER_ONBOARDING_INCOMPLETE = 'breeder_onboarding_incomplete',
    /** 새 상담 신청 (브리더가 받음) */
    NEW_CONSULT_REQUEST = 'new_consult_request',
    /** 상담 신청 확인 (신청자가 받음) */
    CONSULT_REQUEST_CONFIRMED = 'consult_request_confirmed',
    /** 새 후기 등록 (브리더가 받음) */
    NEW_REVIEW_REGISTERED = 'new_review_registered',
    /** 상담 완료 (입양자가 받음) */
    CONSULT_COMPLETED = 'consult_completed',
    /** 새 반려동물 등록 (즐겨찾기한 입양자들이 받음) */
    NEW_PET_REGISTERED = 'new_pet_registered',
    /** 서류 미제출 리마인드 */
    DOCUMENT_REMINDER = 'document_reminder',
}

/**
 * 알림 타입별 메시지 템플릿
 * 백엔드에서 관리하는 고정 메시지
 */
export const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
    [NotificationType.BREEDER_APPROVED]: {
        title: '포퐁 브리더 입점이 승인되었습니다!',
        body: '지금 프로필을 세팅하고 아이들 정보를 등록해 보세요.',
    },
    [NotificationType.BREEDER_UNAPPROVED]: {
        title: '브리더 입점 심사 결과, 보완이 필요합니다.',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.BREEDER_ONBOARDING_INCOMPLETE]: {
        title: '브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
    [NotificationType.NEW_CONSULT_REQUEST]: {
        title: '새로운 입양 상담 신청이 도착했어요!',
        body: '지금 확인해 보세요.',
    },
    [NotificationType.CONSULT_REQUEST_CONFIRMED]: {
        title: '상담 신청이 접수되었습니다!',
        body: '{breederName}님이 확인 후 연락드릴 예정입니다.',
    },
    [NotificationType.NEW_REVIEW_REGISTERED]: {
        title: '새로운 후기가 등록되었어요!',
        body: '브리더 프로필에서 후기를 확인해 보세요.',
    },
    [NotificationType.CONSULT_COMPLETED]: {
        title: '{breederName}님과의 상담이 완료되었어요!',
        body: '어떠셨는지 후기를 남겨주세요.',
    },
    [NotificationType.NEW_PET_REGISTERED]: {
        title: '{breederName}님이 새로운 아이를 등록했어요!',
        body: '지금 바로 확인해보세요.',
    },
    [NotificationType.DOCUMENT_REMINDER]: {
        title: '🐾 브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
};

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
    @Prop({ required: true, enum: Object.values(NotificationType) })
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
    metadata?: {
        breederId?: string;
        breederName?: string;
        petId?: string;
        petName?: string;
        applicationId?: string;
        reviewId?: string;
        [key: string]: any;
    };

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
