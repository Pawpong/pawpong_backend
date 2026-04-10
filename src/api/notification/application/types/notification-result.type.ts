import { NotificationType } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';
import type { PageResult } from '../../../../common/types/page-result.type';

export type NotificationItemResult = {
    notificationId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
};

export type NotificationPageResult = PageResult<NotificationItemResult>;

export type NotificationUnreadCountResult = {
    unreadCount: number;
};

export type NotificationReadResult = {
    notificationId: string;
    isRead: boolean;
    readAt: Date;
};

export type NotificationBulkReadResult = {
    updatedCount: number;
};
