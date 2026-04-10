import { NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { Notification, NotificationType } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';
import { NotificationUserRole } from './notification-command.port';
import type { NotificationItemResult } from '../types/notification-result.type';

export const CREATE_NOTIFICATION_DISPATCH_USE_CASE = Symbol('CREATE_NOTIFICATION_DISPATCH_USE_CASE');
export const CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE = Symbol(
    'CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE',
);
export const SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE = Symbol('SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE');

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
