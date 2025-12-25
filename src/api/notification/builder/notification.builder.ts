import { NotificationType, RecipientType } from '../../../common/enum/user.enum';
import { NotificationResponseDto } from '../dto/response/notification-response.dto';

// Alias for backward compatibility
export type NotificationItemDto = NotificationResponseDto;

export interface EmailData {
    to: string;
    subject: string;
    html: string;
}

export interface NotificationCreateData {
    recipientId: string;
    recipientType: RecipientType;
    type: NotificationType;
    title: string;
    content: string;
    relatedId?: string;
    relatedType?: string;
    metadata?: Record<string, any>;
    targetUrl?: string;
}

export interface NotificationSendResult {
    notification: NotificationItemDto;
    emailSent: boolean;
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
    private notificationMetadata?: Record<string, any>;
    private notificationTargetUrl?: string;
    private emailData?: EmailData;

    constructor(
        private readonly createFn: (data: NotificationCreateData) => Promise<NotificationItemDto>,
        private readonly sendEmailFn: (data: EmailData) => boolean,
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
    metadata(data: Record<string, any>): this {
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
     * 알림 전송 (서비스 알림 + 이메일)
     * 이메일은 비동기로 발송되며 결과를 기다리지 않음
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

        // 2. 이메일 발송 (비동기, 결과를 기다리지 않음 - 내부에서 fire-and-forget 처리)
        if (this.emailData) {
            this.sendEmailFn(this.emailData);
        }

        return {
            notification,
            emailSent: !!this.emailData, // 발송 시작 여부 반환
        };
    }
}
