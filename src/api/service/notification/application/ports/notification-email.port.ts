import { EmailData } from '../../builder/notification.builder';

export const NOTIFICATION_EMAIL_PORT = Symbol('NOTIFICATION_EMAIL_PORT');

export interface NotificationEmailPort {
    send(emailData: EmailData): boolean;
}
