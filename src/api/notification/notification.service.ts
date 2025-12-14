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
import { PaginationResponseDto } from '../../common/dto/pagination/pagination-response.dto';
import { PaginationBuilder } from '../../common/dto/pagination/pagination-builder.dto';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';
import { NotificationBuilder, NotificationCreateData, EmailData } from './notification.builder';
import { RecipientType } from '../../common/enum/user.enum';
import { MailService } from '../../common/mail/mail.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        private readonly logger: CustomLoggerService,
        private readonly mailService: MailService,
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
        this.logger.logStart('getNotifications', '알림 목록 조회 시작', { userId, filter });

        const query: any = { userId };

        // 읽음 여부 필터
        if (filter.isRead !== undefined) {
            query.isRead = filter.isRead;
        }

        const page = filter.pageNumber || 1;
        const limit = filter.itemsPerPage || 20;
        const skip = (page - 1) * limit;

        const [notifications, totalItems] = await Promise.all([
            this.notificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.notificationModel.countDocuments(query).exec(),
        ]);

        const items = notifications.map((n) => ({
            notificationId: n._id.toString(),
            type: n.type,
            title: n.title,
            body: n.body,
            metadata: n.metadata,
            isRead: n.isRead,
            readAt: n.readAt,
            targetUrl: n.targetUrl,
            createdAt: n.createdAt,
        }));

        const result = new PaginationBuilder<NotificationResponseDto>()
            .setItems(items)
            .setPage(page)
            .setTake(limit)
            .setTotalCount(totalItems)
            .build();

        this.logger.logSuccess('getNotifications', '알림 목록 조회 완료', {
            totalItems,
            returnedItems: items.length,
        });

        return result;
    }

    /**
     * 읽지 않은 알림 수 조회
     */
    async getUnreadCount(userId: string): Promise<UnreadCountResponseDto> {
        this.logger.logStart('getUnreadCount', '읽지 않은 알림 수 조회 시작', { userId });

        const unreadCount = await this.notificationModel.countDocuments({ userId, isRead: false }).exec();

        this.logger.logSuccess('getUnreadCount', '읽지 않은 알림 수 조회 완료', { unreadCount });

        return { unreadCount };
    }

    /**
     * 알림 읽음 처리
     */
    async markAsRead(userId: string, notificationId: string): Promise<MarkAsReadResponseDto> {
        this.logger.logStart('markAsRead', '알림 읽음 처리 시작', { userId, notificationId });

        const notification = await this.notificationModel.findOne({ _id: notificationId, userId }).exec();

        if (!notification) {
            throw new NotFoundException('알림을 찾을 수 없습니다.');
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        this.logger.logSuccess('markAsRead', '알림 읽음 처리 완료', { notificationId });

        return {
            notificationId: (notification._id as any).toString(),
            isRead: notification.isRead,
            readAt: notification.readAt,
        };
    }

    /**
     * 모든 알림 읽음 처리
     */
    async markAllAsRead(userId: string): Promise<MarkAllAsReadResponseDto> {
        this.logger.logStart('markAllAsRead', '모든 알림 읽음 처리 시작', { userId });

        const result = await this.notificationModel
            .updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt: new Date() } })
            .exec();

        this.logger.logSuccess('markAllAsRead', '모든 알림 읽음 처리 완료', {
            updatedCount: result.modifiedCount,
        });

        return { updatedCount: result.modifiedCount };
    }

    /**
     * 알림 삭제
     */
    async deleteNotification(userId: string, notificationId: string): Promise<void> {
        this.logger.logStart('deleteNotification', '알림 삭제 시작', { userId, notificationId });

        const result = await this.notificationModel.deleteOne({ _id: notificationId, userId }).exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('알림을 찾을 수 없습니다.');
        }

        this.logger.logSuccess('deleteNotification', '알림 삭제 완료', { notificationId });
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
            metadata: undefined,
            targetUrl: data.relatedId,
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
     * @returns 발송 성공 여부
     */
    private async sendEmail(emailData: EmailData): Promise<boolean> {
        try {
            this.logger.logStart('sendEmail', '이메일 발송 시작', {
                to: emailData.to,
                subject: emailData.subject,
            });

            // MailService를 사용하여 실제 이메일 발송
            const result = await this.mailService.sendMail({
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
            });

            if (result) {
                this.logger.logSuccess('sendEmail', '이메일 발송 완료', { to: emailData.to });
            } else {
                this.logger.logWarning('sendEmail', '이메일 발송 실패 (MailService 반환값 false)', {
                    to: emailData.to,
                });
            }

            return result;
        } catch (error) {
            this.logger.logError('sendEmail', '이메일 발송 중 에러 발생', error);
            return false;
        }
    }
}
