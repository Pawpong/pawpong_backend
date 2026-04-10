import { NotificationType } from '../../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../../schema/notification.schema';
import type { NotificationUserRole } from '../../../application/ports/notification-command.port';

export interface NotificationAdminListFilterSnapshot {
    userId?: string;
    userRole?: 'adopter' | 'breeder';
    type?: NotificationType;
    isRead?: boolean;
    page: number;
    limit: number;
}

export interface NotificationAdminRecordSnapshot {
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
}

export interface NotificationAdminPageSnapshot {
    items: NotificationAdminRecordSnapshot[];
    totalItems: number;
}

export interface NotificationAdminStatsSnapshot {
    totalNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByRole: Record<string, number>;
}

export const NOTIFICATION_ADMIN_READER = Symbol('NOTIFICATION_ADMIN_READER');

export interface NotificationAdminReaderPort {
    findPaged(filter: NotificationAdminListFilterSnapshot): Promise<NotificationAdminPageSnapshot>;
    getStats(): Promise<NotificationAdminStatsSnapshot>;
}
