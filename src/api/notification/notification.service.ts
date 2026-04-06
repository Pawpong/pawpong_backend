import { Injectable } from '@nestjs/common';
import { Notification, NotificationType } from '../../schema/notification.schema';
import { NotificationListRequestDto } from './dto/request/notification-list-request.dto';
import {
    NotificationResponseDto,
    UnreadCountResponseDto,
    MarkAsReadResponseDto,
    MarkAllAsReadResponseDto,
} from './dto/response/notification-response.dto';
import { NotificationBuilder, NotificationCreateData, EmailData } from './builder/notification.builder';
import { RecipientType } from '../../common/enum/user.enum';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { CreateNotificationFromBuilderUseCase } from './application/use-cases/create-notification-from-builder.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

@Injectable()
export class NotificationService {
    constructor(
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly createNotificationFromBuilderUseCase: CreateNotificationFromBuilderUseCase,
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
        private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
        private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
        private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    /**
     * 알림 생성 (내부용 헬퍼 메서드)
     */
    async createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: Record<string, any>,
        targetUrl?: string,
    ): Promise<Notification> {
        return this.createNotificationUseCase.execute(userId, userRole, type, metadata, targetUrl);
    }

    /**
     * 알림 목록 조회
     */
    async getNotifications(
        userId: string,
        filter: NotificationListRequestDto,
    ): Promise<PaginationResponseDto<NotificationResponseDto>> {
        return this.getNotificationsUseCase.execute(userId, filter);
    }

    /**
     * 읽지 않은 알림 수 조회
     */
    async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
        return this.getUnreadNotificationCountUseCase.execute(userId);
    }

    /**
     * 알림 읽음 처리
     */
    async markAsRead(userId: string, notificationId: string): Promise<MarkAsReadResponseDto> {
        return this.markNotificationReadUseCase.execute(userId, notificationId);
    }

    /**
     * 모든 알림 읽음 처리
     */
    async markAllAsRead(userId: string): Promise<MarkAllAsReadResponseDto> {
        return this.markAllNotificationsReadUseCase.execute(userId);
    }

    /**
     * 알림 삭제
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        await this.deleteNotificationUseCase.execute(userId, notificationId);
    }

    /**
     * 빌더 패턴 시작 (하위 호환성)
     * @deprecated 새로운 코드에서는 createNotification()을 직접 사용하세요
     */
    to(recipientId: string, recipientType: RecipientType): NotificationBuilder {
        return new NotificationBuilder(
            (data: NotificationCreateData) => this.createNotificationFromBuilder(data),
            (emailData: EmailData) => this.sendEmail(emailData),
            recipientId,
            recipientType,
        );
    }

    /**
     * 빌더에서 알림 생성 (내부용)
     * 하위 호환성을 위해 구 버전 NotificationType도 처리
     */
    private async createNotificationFromBuilder(data: NotificationCreateData): Promise<NotificationResponseDto> {
        return this.createNotificationFromBuilderUseCase.execute(data);
    }

    /**
     * 이메일 발송 (내부용)
     * @param emailData 이메일 데이터
     * @returns 발송 시작 여부 (비동기 발송, 결과를 기다리지 않음)
     */
    private sendEmail(emailData: EmailData): boolean {
        return this.sendNotificationEmailUseCase.execute(emailData);
    }
}
