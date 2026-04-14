import { NotificationType } from '../../../../common/enum/user.enum';
import type { NotificationDocumentRecord } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

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
    create(command: NotificationCreateCommand): Promise<NotificationDocumentRecord>;
}
