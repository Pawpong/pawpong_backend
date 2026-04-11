import { NotificationType } from '../../../../../common/enum/user.enum';

export type BreederAdminReminderEmailTemplate = 'document_reminder' | 'profile_completion_reminder';

export interface BreederAdminNotificationRecipient {
    breederId: string;
    breederName: string;
    emailAddress?: string;
}

export interface BreederAdminReminderNotificationCommand {
    recipient: BreederAdminNotificationRecipient;
    notificationType: NotificationType;
    title: string;
    content: string;
    targetUrl: string;
    emailTemplate: BreederAdminReminderEmailTemplate;
}

export const BREEDER_ADMIN_NOTIFIER_PORT = Symbol('BREEDER_ADMIN_NOTIFIER_PORT');

export interface BreederAdminNotifierPort {
    sendSuspensionEmail(recipient: BreederAdminNotificationRecipient, reason: string): Promise<void>;
    sendUnsuspensionEmail(recipient: BreederAdminNotificationRecipient): Promise<void>;
    sendReminder(command: BreederAdminReminderNotificationCommand): Promise<void>;
}
