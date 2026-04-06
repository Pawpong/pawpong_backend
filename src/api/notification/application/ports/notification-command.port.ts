import { NotificationType } from '../../../../schema/notification.schema';
import { Notification } from '../../../../schema/notification.schema';

export const NOTIFICATION_COMMAND_PORT = Symbol('NOTIFICATION_COMMAND_PORT');

export type NotificationUserRole = 'adopter' | 'breeder';

export interface NotificationCreateCommand {
    userId: string;
    userRole: NotificationUserRole;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, any>;
    targetUrl?: string;
    isRead?: boolean;
}

export interface NotificationCommandPort {
    create(command: NotificationCreateCommand): Promise<Notification>;
}
