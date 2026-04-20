import { NotificationBuilder } from '../../builder/notification.builder';
import { RecipientType } from '../../../../common/enum/user.enum';
import { NotificationType } from '../../../../common/enum/user.enum';
import type { NotificationDocumentRecord } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

export const NOTIFICATION_DISPATCH_PORT = Symbol('NOTIFICATION_DISPATCH_PORT');

export interface NotificationDispatchPort {
    createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<NotificationDocumentRecord>;

    to(recipientId: string, recipientType: RecipientType): NotificationBuilder;
}
