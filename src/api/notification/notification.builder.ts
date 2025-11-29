import { NotificationType, RecipientType } from '../../common/enum/user.enum';
import { NotificationItemDto } from './dto/response/notification-response.dto';

/**
 * 알림 빌더
 *
 * 다른 서비스에서 알림을 쉽게 생성할 수 있도록 빌더 패턴을 제공합니다.
 *
 * @example
 * await this.notificationService
 *     .to(breederId, RecipientType.BREEDER)
 *     .type(NotificationType.PROFILE_REVIEW)
 *     .title('프로필 심사 완료')
 *     .content('프로필 심사가 완료되었습니다.')
 *     .related(applicationId, 'application')
 *     .send();
 */
export class NotificationBuilder {
    private notificationType: NotificationType;
    private notificationTitle: string;
    private notificationContent: string;
    private relatedResourceId?: string;
    private relatedResourceType?: string;

    constructor(
        private readonly createFn: (data: {
            recipientId: string;
            recipientType: RecipientType;
            type: NotificationType;
            title: string;
            content: string;
            relatedId?: string;
            relatedType?: string;
        }) => Promise<NotificationItemDto>,
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
     * 알림 전송
     */
    async send(): Promise<NotificationItemDto> {
        if (!this.notificationType) {
            throw new Error('알림 타입이 설정되지 않았습니다.');
        }
        if (!this.notificationTitle) {
            throw new Error('알림 제목이 설정되지 않았습니다.');
        }
        if (!this.notificationContent) {
            throw new Error('알림 내용이 설정되지 않았습니다.');
        }

        return this.createFn({
            recipientId: this.recipientId,
            recipientType: this.recipientType,
            type: this.notificationType,
            title: this.notificationTitle,
            content: this.notificationContent,
            relatedId: this.relatedResourceId,
            relatedType: this.relatedResourceType,
        });
    }
}
