import { NotificationBuilder } from '../../builder/notification.builder';
import { NotificationType, Notification } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';
import { RecipientType } from '../../../../common/enum/user.enum';

export const NOTIFICATION_DISPATCH_PORT = Symbol('NOTIFICATION_DISPATCH_PORT');

export interface NotificationDispatchPort {
    createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<Notification>;

    to(recipientId: string, recipientType: RecipientType): NotificationBuilder;
}
