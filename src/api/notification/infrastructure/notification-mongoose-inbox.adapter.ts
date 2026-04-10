import { Injectable } from '@nestjs/common';
import {
    NotificationInboxListOptions,
    NotificationInboxPort,
    NotificationInboxRecord,
} from '../application/ports/notification-inbox.port';
import { NotificationRepository } from '../repository/notification.repository';

@Injectable()
export class NotificationMongooseInboxAdapter implements NotificationInboxPort {
    constructor(private readonly notificationRepository: NotificationRepository) {}

    async findPagedByUser(
        userId: string,
        options: NotificationInboxListOptions,
    ): Promise<{ items: NotificationInboxRecord[]; totalItems: number }> {
        return this.notificationRepository.findPagedByUser(userId, options);
    }

    countUnreadByUser(userId: string): Promise<number> {
        return this.notificationRepository.countUnreadByUser(userId);
    }

    findByIdForUser(userId: string, notificationId: string): Promise<NotificationInboxRecord | null> {
        return this.notificationRepository.findByIdForUser(userId, notificationId);
    }

    markAsRead(userId: string, notificationId: string, readAt: Date): Promise<NotificationInboxRecord | null> {
        return this.notificationRepository.markAsRead(userId, notificationId, readAt);
    }

    markAllAsRead(userId: string, readAt: Date): Promise<number> {
        return this.notificationRepository.markAllAsRead(userId, readAt);
    }

    deleteForUser(userId: string, notificationId: string): Promise<number> {
        return this.notificationRepository.deleteForUser(userId, notificationId);
    }
}
