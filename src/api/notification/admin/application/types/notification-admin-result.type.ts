import { NotificationType } from '../../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../../schema/notification.schema';
import type { NotificationUserRole } from '../../../application/ports/notification-command.port';
import type { PageResult } from '../../../../../common/types/page-result.type';

export type NotificationAdminItemResult = {
    notificationId: string;
    userId: string;
    userRole: NotificationUserRole;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: Date;
    targetUrl?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type NotificationAdminPageResult = PageResult<NotificationAdminItemResult>;

export type NotificationAdminStatsResult = {
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByRole: Record<string, number>;
};
