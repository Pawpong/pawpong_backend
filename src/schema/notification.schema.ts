import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { NotificationType } from '../common/enum/user.enum';

// Re-export for backward compatibility
export { NotificationType } from '../common/enum/user.enum';

/**
 * 알림 타입별 메시지 템플릿
 * 백엔드에서 관리하는 고정 메시지
 */
export const NOTIFICATION_MESSAGES: Record<NotificationType, { title: string; body: string }> = {
    [NotificationType.PROFILE_REVIEW]: {
        title: '프로필 심사 중입니다',
        body: '프로필 심사가 진행 중입니다. 잠시만 기다려주세요.',
    },
    [NotificationType.PROFILE_RE_REVIEW]: {
        title: '프로필 재심사가 필요합니다',
        body: '프로필을 다시 확인해주세요.',
    },
    [NotificationType.MATCHING]: {
        title: '새로운 매칭이 있습니다',
        body: '매칭 결과를 확인해보세요.',
    },
    [NotificationType.BREEDER_APPROVED]: {
        title: '포퐁 브리더 입점이 승인되었습니다!',
        body: '지금 프로필을 세팅하고 아이들 정보를 등록해 보세요.',
    },
    [NotificationType.BREEDER_REJECTED]: {
        title: '브리더 입점 심사 결과, 보완이 필요합니다.',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.BREEDER_UNAPPROVED]: {
        title: '브리더 입점 심사 결과, 보완이 필요합니다.',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.BREEDER_ONBOARDING_INCOMPLETE]: {
        title: '브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
    [NotificationType.BREEDER_SUSPENDED]: {
        title: '브리더 계정이 정지되었습니다',
        body: '자세한 사유는 이메일을 확인해주세요.',
    },
    [NotificationType.NEW_CONSULT_REQUEST]: {
        title: '새로운 입양 상담 신청이 도착했어요!',
        body: '지금 확인해 보세요.',
    },
    [NotificationType.CONSULT_REQUEST_CONFIRMED]: {
        title: '상담 신청이 접수되었습니다!',
        body: '{breederName}님이 확인 후 연락드릴 예정입니다.',
    },
    [NotificationType.CONSULT_COMPLETED]: {
        title: '{breederName}님과의 상담이 완료되었어요!',
        body: '어떠셨는지 후기를 남겨주세요.',
    },
    [NotificationType.DOCUMENT_REMINDER]: {
        title: '🐾 브리더 입점 절차가 아직 완료되지 않았어요!',
        body: '필요한 서류들을 제출하시면 입양자에게 프로필이 공개됩니다.',
    },
    [NotificationType.NEW_REVIEW_REGISTERED]: {
        title: '새로운 후기가 등록되었어요!',
        body: '브리더 프로필에서 후기를 확인해 보세요.',
    },
    [NotificationType.NEW_PET_REGISTERED]: {
        title: '{breederName}님이 새로운 아이를 등록했어요!',
        body: '지금 바로 확인해보세요.',
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
