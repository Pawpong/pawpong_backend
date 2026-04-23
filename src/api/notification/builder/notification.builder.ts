import { NotificationType, RecipientType } from '../../../common/enum/user.enum';
import type { NotificationItemResult } from '../application/types/notification-result.type';
import type { NotificationMetadata } from '../types/notification-metadata.type';

// Alias for backward compatibility
export type NotificationItemDto = NotificationItemResult;

export interface EmailData {
    to: string;
    subject: string;
    html: string;
}

/** FCM 푸시 페이로드 오버라이드 (withPush 옵션) */
export interface PushOverrideData {
    /** 알림 탭 시 앱 내에서 이동할 경로 (기본: notification.targetUrl) */
    targetUrl?: string;
    /** 백그라운드 데이터 페이로드 (모두 string으로 직렬화 필요) */
    data?: Record<string, string>;
}

/** Builder가 dispatch 서비스에 요청하는 푸시 발송 명세 */
export interface PushDispatchData {
    userId: string;
    userRole: 'adopter' | 'breeder';
    title: string;
    body: string;
    targetUrl?: string;
    data?: Record<string, string>;
}

export interface NotificationCreateData {
    recipientId: string;
    recipientType: RecipientType;
    type: NotificationType;
    title: string;
    content: string;
    relatedId?: string;
    relatedType?: string;
    metadata?: NotificationMetadata;
    targetUrl?: string;
}

export interface NotificationSendResult {
    notification: NotificationItemDto;
    emailSent: boolean;
    pushRequested: boolean;
}

/**
 * 알림 빌더
 *
 * 다른 서비스에서 알림을 쉽게 생성할 수 있도록 빌더 패턴을 제공합니다.
 * 서비스 알림과 이메일을 동시에 발송할 수 있습니다.
 *
 * @example
 * // 서비스 알림만 발송
 * await this.notificationService
 *     .to(breederId, RecipientType.BREEDER)
 *     .type(NotificationType.NEW_REVIEW)
 *     .title('새로운 후기')
 *     .content('후기가 등록되었습니다.')
 *     .send();
 *
 * @example
 * // 서비스 알림 + 이메일 동시 발송
 * await this.notificationService
 *     .to(breederId, RecipientType.BREEDER)
 *     .type(NotificationType.BREEDER_APPROVED)
 *     .title('입점 승인')
 *     .content('브리더 입점이 승인되었습니다.')
 *     .withEmail({
 *         to: breederEmail,
 *         subject: '[포퐁] 브리더 입점 승인',
 *         html: emailHtml,
 *     })
 *     .send();
 */
export class NotificationBuilder {
    private notificationType: NotificationType;
    private notificationTitle: string;
    private notificationContent: string;
    private relatedResourceId?: string;
    private relatedResourceType?: string;
    private notificationMetadata?: NotificationMetadata;
    private notificationTargetUrl?: string;
    private emailData?: EmailData;
    private pushEnabled = false;
    private pushOverride?: PushOverrideData;

    constructor(
        private readonly createFn: (data: NotificationCreateData) => Promise<NotificationItemDto>,
        private readonly sendEmailFn: (data: EmailData) => boolean,
        private readonly sendPushFn: (data: PushDispatchData) => void,
        private readonly recipientId: string,
        private readonly recipientType: RecipientType,
    ) {}

    /**
     * 알림 타입 설정
     */
    type(type: NotificationType): this {
        this.notificationType = type;
        return this;
    }

    /**
     * 알림 제목 설정
     */
    title(title: string): this {
        this.notificationTitle = title;
        return this;
    }

    /**
     * 알림 내용 설정
     */
    content(content: string): this {
        this.notificationContent = content;
        return this;
    }

    /**
     * 관련 리소스 설정 (선택적)
     * 클릭 시 이동할 대상 지정
     */
    related(id: string, type: string): this {
        this.relatedResourceId = id;
        this.relatedResourceType = type;
        return this;
    }

    /**
     * 메타데이터 설정 (선택적)
     * 알림 메시지에 동적으로 치환될 데이터 설정
     * @example
     * .metadata({ breederName: '행복한 강아지' })
     */
    metadata(data: NotificationMetadata): this {
        this.notificationMetadata = data;
        return this;
    }

    /**
     * 클릭 시 이동할 URL 설정 (선택적)
     * @example
     * .targetUrl('/breeder/verification')
     */
    targetUrl(url: string): this {
        this.notificationTargetUrl = url;
        return this;
    }

    /**
     * 이메일 발송 설정 (선택적)
     * 서비스 알림과 함께 이메일도 발송합니다.
     */
    withEmail(emailData: EmailData): this {
        this.emailData = emailData;
        return this;
    }

    /**
     * 푸시 알림 발송 설정 (선택적, opt-in)
     * 서비스 알림과 함께 사용자의 모든 등록 디바이스에 FCM 푸시를 발송합니다.
     * title/body 는 자동으로 notification.title/content 가 사용됩니다.
     *
     * @example
     * .withPush()                 // 기본 설정으로 발송
     * .withPush({ targetUrl: '/applications/123' })  // 특정 경로 오버라이드
     */
    withPush(override?: PushOverrideData): this {
        this.pushEnabled = true;
        this.pushOverride = override;
        return this;
    }

    /**
     * 알림 전송 (서비스 알림 + 이메일 + 푸시)
     * 이메일과 푸시는 비동기로 발송되며 결과를 기다리지 않습니다 (fire-and-forget).
     */
    async send(): Promise<NotificationSendResult> {
        if (!this.notificationType) {
            throw new Error('알림 타입이 설정되지 않았습니다.');
        }
        if (!this.notificationTitle) {
            throw new Error('알림 제목이 설정되지 않았습니다.');
        }
        if (!this.notificationContent) {
            throw new Error('알림 내용이 설정되지 않았습니다.');
        }

        // 1. 서비스 알림 저장
        const notification = await this.createFn({
            recipientId: this.recipientId,
            recipientType: this.recipientType,
            type: this.notificationType,
            title: this.notificationTitle,
            content: this.notificationContent,
            relatedId: this.relatedResourceId,
            relatedType: this.relatedResourceType,
            metadata: this.notificationMetadata,
            targetUrl: this.notificationTargetUrl,
        });

        // 2. 이메일 발송 (fire-and-forget)
        if (this.emailData) {
            this.sendEmailFn(this.emailData);
        }

        // 3. 푸시 발송 (fire-and-forget)
        if (this.pushEnabled) {
            const role = this.recipientType === RecipientType.ADOPTER ? 'adopter' : 'breeder';
            this.sendPushFn({
                userId: this.recipientId,
                userRole: role,
                title: this.notificationTitle,
                body: this.notificationContent,
                targetUrl: this.pushOverride?.targetUrl ?? this.notificationTargetUrl,
                data: this.pushOverride?.data,
            });
        }

        return {
            notification,
            emailSent: !!this.emailData,
            pushRequested: this.pushEnabled,
        };
    }
}
