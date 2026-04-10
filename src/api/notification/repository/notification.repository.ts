import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { Notification } from '../../../schema/notification.schema';
import { NotificationCreateCommand } from '../application/ports/notification-command.port';
import { NotificationInboxListOptions, NotificationInboxRecord } from '../application/ports/notification-inbox.port';
import type { NotificationDocumentRecord } from '../types/notification-record.type';

@Injectable()
export class NotificationRepository {
    constructor(@InjectModel(Notification.name) private readonly notificationModel: Model<Notification>) {}

    async create(command: NotificationCreateCommand): Promise<Notification> {
        const notification = new this.notificationModel({
            userId: command.userId,
            userRole: command.userRole,
            type: command.type,
            title: command.title,
            body: command.body,
            metadata: command.metadata,
            targetUrl: command.targetUrl,
            isRead: command.isRead ?? false,
        });

        await notification.save();

        return notification;
    }

    async findPagedByUser(
        userId: string,
        options: NotificationInboxListOptions,
    ): Promise<{ items: NotificationInboxRecord[]; totalItems: number }> {
        const query: FilterQuery<Notification> = { userId };
        if (options.isRead !== undefined) {
            query.isRead = options.isRead;
        }

        const skip = (options.page - 1) * options.limit;
        const [items, totalItems] = await Promise.all([
            this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(options.limit)
                .lean<NotificationDocumentRecord[]>()
                .exec(),
            this.notificationModel.countDocuments(query).exec(),
        ]);

        return {
            items: items.map((item) => this.toInboxRecord(item)),
            totalItems,
        };
    }

    countUnreadByUser(userId: string): Promise<number> {
        return this.notificationModel.countDocuments({ userId, isRead: false }).exec();
    }

    async findByIdForUser(userId: string, notificationId: string): Promise<NotificationInboxRecord | null> {
        const notification = await this.notificationModel
            .findOne({ _id: notificationId, userId })
            .lean<NotificationDocumentRecord>()
            .exec();

        return notification ? this.toInboxRecord(notification) : null;
    }

    async markAsRead(userId: string, notificationId: string, readAt: Date): Promise<NotificationInboxRecord | null> {
        const notification = await this.notificationModel
            .findOneAndUpdate({ _id: notificationId, userId }, { $set: { isRead: true, readAt } }, { new: true })
            .lean<NotificationDocumentRecord>()
            .exec();

        return notification ? this.toInboxRecord(notification) : null;
    }

    async markAllAsRead(userId: string, readAt: Date): Promise<number> {
        const result = await this.notificationModel
            .updateMany({ userId, isRead: false }, { $set: { isRead: true, readAt } })
            .exec();

        return result.modifiedCount;
    }

    async deleteForUser(userId: string, notificationId: string): Promise<number> {
        const result = await this.notificationModel.deleteOne({ _id: notificationId, userId }).exec();
        return result.deletedCount;
    }

    private toInboxRecord(notification: NotificationDocumentRecord): NotificationInboxRecord {
        return {
            _id: notification._id,
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
}
