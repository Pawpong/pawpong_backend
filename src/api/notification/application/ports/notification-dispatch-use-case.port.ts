import { NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { NotificationType } from '../../../../common/enum/user.enum';
import { NotificationUserRole } from './notification-command.port';
import type { NotificationItemResult } from '../types/notification-result.type';
import type { NotificationDocumentRecord } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

export interface CreateNotificationDispatchUseCasePort {
    execute(
        userId: string,
        userRole: NotificationUserRole,
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<NotificationDocumentRecord>;
}

export interface CreateNotificationFromBuilderDispatchUseCasePort {
    execute(data: NotificationCreateData): Promise<NotificationItemResult>;
}

export interface SendNotificationEmailDispatchUseCasePort {
    execute(emailData: EmailData): boolean;
}
