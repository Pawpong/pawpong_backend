import { NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { Notification, NotificationType } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';
import { NotificationUserRole } from './notification-command.port';
import type { NotificationItemResult } from '../types/notification-result.type';

export interface CreateNotificationDispatchUseCasePort {
    execute(
        userId: string,
        userRole: NotificationUserRole,
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<Notification>;
}

export interface CreateNotificationFromBuilderDispatchUseCasePort {
    execute(data: NotificationCreateData): Promise<NotificationItemResult>;
}

export interface SendNotificationEmailDispatchUseCasePort {
    execute(emailData: EmailData): boolean;
}
