import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Notification } from '../../../../schema/notification.schema';
import {
    NotificationAdminListFilterSnapshot,
    NotificationAdminPageSnapshot,
    NotificationAdminReaderPort,
    NotificationAdminRecordSnapshot,
    NotificationAdminStatsSnapshot,
} from '../application/ports/notification-admin-reader.port';

@Injectable()
export class NotificationAdminMongooseReaderAdapter implements NotificationAdminReaderPort {
    constructor(
        @InjectModel(Notification.name)
        private readonly notificationModel: Model<Notification>,
    ) {}

    async findPaged(filter: NotificationAdminListFilterSnapshot): Promise<NotificationAdminPageSnapshot> {
        const query = this.buildQuery(filter);
        const skip = (filter.page - 1) * filter.limit;

        const [notifications, totalItems] = await Promise.all([
            this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(filter.limit)
                .lean()
                .exec(),
            this.notificationModel.countDocuments(query).exec(),
        ]);

        return {
            items: notifications.map((notification: any) => this.toRecord(notification)),
            totalItems,
        };
    }

    async getStats(): Promise<NotificationAdminStatsSnapshot> {
        const [totalNotifications, unreadNotifications, notificationsByType, notificationsByRole] = await Promise.all([
            this.notificationModel.countDocuments().exec(),
            this.notificationModel.countDocuments({ isRead: false }).exec(),
            this.notificationModel.aggregate([
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                    },
                },
            ]),
            this.notificationModel.aggregate([
                {
                    $group: {
                        _id: '$userRole',
                        count: { $sum: 1 },
                    },
                },
            ]),
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
