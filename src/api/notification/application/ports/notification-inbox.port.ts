import { NotificationType } from '../../../../common/enum/user.enum';
import type { NotificationObjectIdLike } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

export const NOTIFICATION_INBOX_PORT = Symbol('NOTIFICATION_INBOX_PORT');

export interface NotificationInboxRecord {
    _id: NotificationObjectIdLike;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
}

export interface NotificationInboxListOptions {
    isRead?: boolean;
    page: number;
    limit: number;
}

export interface NotificationInboxPort {
    findPagedByUser(
        userId: string,
        options: NotificationInboxListOptions,
    ): Promise<{ items: NotificationInboxRecord[]; totalItems: number }>;
    countUnreadByUser(userId: string): Promise<number>;
    findByIdForUser(userId: string, notificationId: string): Promise<NotificationInboxRecord | null>;
    markAsRead(userId: string, notificationId: string, readAt: Date): Promise<NotificationInboxRecord | null>;
    markAllAsRead(userId: string, readAt: Date): Promise<number>;
    deleteForUser(userId: string, notificationId: string): Promise<number>;
}
