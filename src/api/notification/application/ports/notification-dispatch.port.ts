import { NotificationBuilder } from '../../builder/notification.builder';
import { NotificationType, Notification } from '../../../../schema/notification.schema';
import { RecipientType } from '../../../../common/enum/user.enum';

export abstract class NotificationDispatchPort {
    abstract createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: Record<string, any>,
        targetUrl?: string,
    ): Promise<Notification>;

    abstract to(recipientId: string, recipientType: RecipientType): NotificationBuilder;
}
