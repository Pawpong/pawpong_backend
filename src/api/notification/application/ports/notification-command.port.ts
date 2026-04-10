import { NotificationType, Notification } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';

export const NOTIFICATION_COMMAND_PORT = Symbol('NOTIFICATION_COMMAND_PORT');

export type NotificationUserRole = 'adopter' | 'breeder';

export interface NotificationCreateCommand {
    userId: string;
    userRole: NotificationUserRole;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: NotificationMetadata;
    targetUrl?: string;
    isRead?: boolean;
}

export interface NotificationCommandPort {
    create(command: NotificationCreateCommand): Promise<Notification>;
}
