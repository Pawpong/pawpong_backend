import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Notification, NotificationDocument } from '../../schema/notification.schema';
import { NotificationType, RecipientType } from '../../common/enum/user.enum';
import { NotificationBuilder, EmailData } from './notification.builder';
import { MailService } from '../../common/mail/mail.service';
import { CreateNotificationDto } from './dto/request/create-notification.dto';
import {
    NotificationItemDto,
    NotificationListResponseDto,
    ReadNotificationsResponseDto,
} from './dto/response/notification-response.dto';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        private readonly mailService: MailService,
    ) {}

    /**
     * 알림 빌더 시작
     *
     * @example
     * // 서비스 알림만 발송
     * await this.notificationService
     *     .to(breederId, RecipientType.BREEDER)
     *     .type(NotificationType.PROFILE_REVIEW)
     *     .title('프로필 심사 완료')
     *     .content('프로필 심사가 완료되었습니다.')
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
    to(recipientId: string, recipientType: RecipientType): NotificationBuilder {
        return new NotificationBuilder(
            async (data) => {
                const notification = await this.notificationModel.create({
                    recipientId: new Types.ObjectId(data.recipientId),
                    recipientType: data.recipientType,
                    title: data.title,
                    content: data.content,
                    type: data.type,
                    relatedId: data.relatedId ? new Types.ObjectId(data.relatedId) : undefined,
                    relatedType: data.relatedType,
                });
                return this.transformToDto(notification);
            },
            async (emailData: EmailData) => {
                return this.mailService.sendMail(emailData);
            },
            recipientId,
            recipientType,
        );
    }

    /**
     * 알림 생성 (DTO 직접 전달)
     */
    async createNotification(dto: CreateNotificationDto): Promise<NotificationItemDto> {
        const notification = await this.notificationModel.create({
            recipientId: new Types.ObjectId(dto.recipientId),
            recipientType: dto.recipientType,
            title: dto.title,
            content: dto.content,
            type: dto.type,
            relatedId: dto.relatedId ? new Types.ObjectId(dto.relatedId) : undefined,
            relatedType: dto.relatedType,
        });

        return this.transformToDto(notification);
    }

    /**
     * 알림 목록 조회 (초기 로딩)
     * - 신규 알림(읽지 않은 알림): 전체 반환
     * - 읽은 알림: 첫 페이지만 (10개)
     */
    async getNotifications(userId: string, userType: string, limit: number = 10): Promise<NotificationListResponseDto> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('올바르지 않은 사용자 ID 형식입니다.');
        }

        const recipientId = new Types.ObjectId(userId);

        const [unreadNotifications, readNotifications, readTotal] = await Promise.all([
            // 읽지 않은 알림 전체 조회 (최신순)
            this.notificationModel
                .find({ recipientId, recipientType: userType, isRead: false })
                .sort({ createdAt: -1 })
                .lean(),
            // 읽은 알림 첫 페이지 (최신순)
            this.notificationModel
                .find({ recipientId, recipientType: userType, isRead: true })
                .sort({ createdAt: -1 })
                .limit(limit)
                .lean(),
            // 읽은 알림 총 개수
            this.notificationModel.countDocuments({ recipientId, recipientType: userType, isRead: true }),
        ]);

        const unreadItems = unreadNotifications.map((n: any) => this.transformToDto(n));
        const readItems = readNotifications.map((n: any) => this.transformToDto(n));
        const totalPages = Math.ceil(readTotal / limit);

        return {
            unreadNotifications: unreadItems,
            readNotifications: readItems,
            unreadCount: unreadItems.length,
            readTotalCount: readTotal,
            pagination: {
                currentPage: 1,
                pageSize: limit,
                totalItems: readTotal,
                totalPages,
                hasNextPage: 1 < totalPages,
                hasPrevPage: false,
            },
        };
    }

    /**
     * 읽은 알림 더보기 (페이지네이션)
     */
    async getReadNotifications(
        userId: string,
        userType: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<ReadNotificationsResponseDto> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('올바르지 않은 사용자 ID 형식입니다.');
        }

        const recipientId = new Types.ObjectId(userId);
        const skip = (page - 1) * limit;

        const [readNotifications, readTotal] = await Promise.all([
            this.notificationModel
                .find({ recipientId, recipientType: userType, isRead: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.notificationModel.countDocuments({ recipientId, recipientType: userType, isRead: true }),
        ]);

        const items = readNotifications.map((n: any) => this.transformToDto(n));
        const totalPages = Math.ceil(readTotal / limit);

        return {
            items,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems: readTotal,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    /**
     * 읽지 않은 알림 수 조회
     */
    async getUnreadCount(userId: string, userType: string): Promise<number> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('올바르지 않은 사용자 ID 형식입니다.');
        }

        return this.notificationModel.countDocuments({
            recipientId: new Types.ObjectId(userId),
            recipientType: userType,
            isRead: false,
        });
    }

    /**
     * 알림 읽음 처리
     */
    async markAsRead(notificationId: string, userId: string): Promise<NotificationItemDto> {
        if (!Types.ObjectId.isValid(notificationId)) {
            throw new BadRequestException('올바르지 않은 알림 ID 형식입니다.');
        }

        const notification = await this.notificationModel
            .findOneAndUpdate(
                {
                    _id: new Types.ObjectId(notificationId),
                    recipientId: new Types.ObjectId(userId),
                },
                { $set: { isRead: true } },
                { new: true },
            )
            .lean();

        if (!notification) {
            throw new BadRequestException('알림을 찾을 수 없습니다.');
        }

        return this.transformToDto(notification);
    }

    /**
     * 모든 알림 읽음 처리
     */
    async markAllAsRead(userId: string, userType: string): Promise<number> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('올바르지 않은 사용자 ID 형식입니다.');
        }

        const result = await this.notificationModel.updateMany(
            {
                recipientId: new Types.ObjectId(userId),
                recipientType: userType,
                isRead: false,
            },
            { $set: { isRead: true } },
        );

        return result.modifiedCount;
    }

    /**
     * 알림 삭제
     */
    async deleteNotification(notificationId: string, userId: string): Promise<void> {
        if (!Types.ObjectId.isValid(notificationId)) {
            throw new BadRequestException('올바르지 않은 알림 ID 형식입니다.');
        }

        const result = await this.notificationModel.deleteOne({
            _id: new Types.ObjectId(notificationId),
            recipientId: new Types.ObjectId(userId),
        });

        if (result.deletedCount === 0) {
            throw new BadRequestException('알림을 찾을 수 없습니다.');
        }
    }

    private transformToDto(notification: any): NotificationItemDto {
        return {
            notificationId: notification._id.toString(),
            title: notification.title,
            content: notification.content,
            type: notification.type,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            relatedId: notification.relatedId?.toString(),
            relatedType: notification.relatedType,
        };
    }
}
