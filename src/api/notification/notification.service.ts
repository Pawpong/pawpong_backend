import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType, NOTIFICATION_MESSAGES } from '../../schema/notification.schema';
import { NotificationListRequestDto } from './dto/request/notification-list-request.dto';
import {
    NotificationResponseDto,
    UnreadCountResponseDto,
    MarkAsReadResponseDto,
    MarkAllAsReadResponseDto,
} from './dto/response/notification-response.dto';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { NotificationBuilder, NotificationCreateData, EmailData } from './builder/notification.builder';
import { RecipientType } from '../../common/enum/user.enum';
import { MailService } from '../../common/mail/mail.service';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        private readonly logger: CustomLoggerService,
        private readonly mailService: MailService,
        private readonly getNotificationsUseCase: GetNotificationsUseCase,
        private readonly getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
        private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
        private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
        private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
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
        this.logger.logStart('createNotification', '알림 생성 시작', { userId, type });

        // 메시지 템플릿 가져오기
        const template = NOTIFICATION_MESSAGES[type];
        if (!template) {
            throw new BadRequestException(`알 수 없는 알림 타입: ${type}`);
        }

        // 동적 데이터로 메시지 생성
        let title = template.title;
        let body = template.body;

        // 메타데이터에서 치환
        if (metadata) {
            Object.entries(metadata).forEach(([key, value]) => {
                const placeholder = `{${key}}`;
                title = title.replace(placeholder, String(value));
                body = body.replace(placeholder, String(value));
            });
        }

        const notification = new this.notificationModel({
            userId,
            userRole,
            type,
            title,
            body,
            metadata,
            targetUrl,
            isRead: false,
        });

        await notification.save();

        this.logger.logSuccess('createNotification', '알림 생성 완료', {
            notificationId: (notification._id as any).toString(),
        });

        return notification;
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
        // RecipientType을 userRole로 변환
        const userRole = data.recipientType === RecipientType.BREEDER ? 'breeder' : 'adopter';

        // 구 버전 빌더는 직접 DB에 저장 (NOTIFICATION_MESSAGES를 사용하지 않음)
        const notification = new this.notificationModel({
            userId: data.recipientId,
            userRole,
            type: data.type, // NotificationType enum은 이미 소문자 값으로 정의됨 (e.g., 'consult_request_confirmed')
            title: data.title,
            body: data.content,
            metadata: data.metadata,
            targetUrl: data.targetUrl, // targetUrl 필드 사용
            isRead: false,
        });

        await notification.save();

        this.logger.logSuccess('createNotificationFromBuilder', '빌더를 통한 알림 생성 완료', {
            notificationId: (notification._id as any).toString(),
        });

        // Notification을 NotificationResponseDto로 변환
        return {
            notificationId: (notification._id as any).toString(),
            type: notification.type,
            title: notification.title,
            body: notification.body,
            metadata: notification.metadata,
            isRead: notification.isRead,
            readAt: notification.readAt,
            targetUrl: notification.targetUrl,
            createdAt: notification.createdAt,
        };
    }

    /**
     * 이메일 발송 (내부용)
     * @param emailData 이메일 데이터
     * @returns 발송 시작 여부 (비동기 발송, 결과를 기다리지 않음)
     */
    private sendEmail(emailData: EmailData): boolean {
        this.logger.logStart('sendEmail', '이메일 발송 시작 (비동기)', {
            to: emailData.to,
            subject: emailData.subject,
        });

        // MailService를 사용하여 비동기 이메일 발송 (결과를 기다리지 않음)
        this.mailService
            .sendMail({
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
            })
            .then((result) => {
                if (result) {
                    this.logger.logSuccess('sendEmail', '이메일 발송 완료', { to: emailData.to });
                } else {
                    this.logger.logWarning('sendEmail', '이메일 발송 실패 (MailService 반환값 false)', {
                        to: emailData.to,
                    });
                }
            })
            .catch((error) => {
                this.logger.logError('sendEmail', '이메일 발송 중 에러 발생', error);
            });

        return true; // 발송 시작됨
    }
}
