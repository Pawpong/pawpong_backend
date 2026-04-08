import { NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { NotificationResponseDto } from '../../dto/response/notification-response.dto';
import { Notification, NotificationType } from '../../../../schema/notification.schema';
import { NotificationUserRole } from './notification-command.port';

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
        metadata?: Record<string, any>,
        targetUrl?: string,
    ): Promise<Notification>;
}

export interface CreateNotificationFromBuilderDispatchUseCasePort {
    execute(data: NotificationCreateData): Promise<NotificationResponseDto>;
}

export interface SendNotificationEmailDispatchUseCasePort {
    execute(emailData: EmailData): boolean;
}
