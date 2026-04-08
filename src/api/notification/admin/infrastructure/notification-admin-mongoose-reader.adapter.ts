import { Injectable } from '@nestjs/common';
import {
    NotificationAdminListFilterSnapshot,
    NotificationAdminPageSnapshot,
    NotificationAdminReaderPort,
    NotificationAdminRecordSnapshot,
    NotificationAdminStatsSnapshot,
} from '../application/ports/notification-admin-reader.port';
import { NotificationAdminRepository } from '../repository/notification-admin.repository';

@Injectable()
export class NotificationAdminMongooseReaderAdapter implements NotificationAdminReaderPort {
    constructor(private readonly notificationAdminRepository: NotificationAdminRepository) {}

    async findPaged(filter: NotificationAdminListFilterSnapshot): Promise<NotificationAdminPageSnapshot> {
        const query = this.buildQuery(filter);

        const [notifications, totalItems] = await Promise.all([
            this.notificationAdminRepository.findPaged(query, filter.page, filter.limit),
            this.notificationAdminRepository.countDocuments(query),
        ]);

        return {
            items: notifications.map((notification: any) => this.toRecord(notification)),
            totalItems,
        };
    }

    async getStats(): Promise<NotificationAdminStatsSnapshot> {
        const [totalNotifications, unreadNotifications, notificationsByType, notificationsByRole] = await Promise.all([
            this.notificationAdminRepository.countAll(),
            this.notificationAdminRepository.countUnread(),
            this.notificationAdminRepository.aggregateByType(),
            this.notificationAdminRepository.aggregateByRole(),
        ]);

        return {
            totalNotifications,
            unreadNotifications,
            notificationsByType: this.toStatsRecord(notificationsByType),
            notificationsByRole: this.toStatsRecord(notificationsByRole),
        };
    }

    private buildQuery(filter: NotificationAdminListFilterSnapshot): Record<string, any> {
        const query: Record<string, any> = {};

        if (filter.userId) {
            query.userId = filter.userId;
        }
        if (filter.userRole) {
            query.userRole = filter.userRole;
        }
        if (filter.type) {
            query.type = filter.type;
        }
        if (filter.isRead !== undefined) {
            query.isRead = filter.isRead;
        }

        return query;
    }

    private toRecord(notification: any): NotificationAdminRecordSnapshot {
        return {
            notificationId: notification._id.toString(),
            userId: notification.userId,
            userRole: notification.userRole,
            type: notification.type,
            title: notification.title,
            body: notification.body,
            metadata: notification.metadata,
            isRead: notification.isRead,
            readAt: notification.readAt,
            targetUrl: notification.targetUrl,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        };
    }

    private toStatsRecord(items: Array<{ _id: string; count: number }>): Record<string, number> {
        return items.reduce<Record<string, number>>((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});
    }
}
