import { Injectable } from '@nestjs/common';

import { RecipientType } from '../../../../common/enum/user.enum';
import { MailService } from '../../../../common/mail/mail.service';
import { MailTemplateService } from '../../../../common/mail/mail-template.service';
import { NotificationService } from '../../../../api/notification/notification.service';
import {
    BreederAdminNotifierPort,
    BreederAdminNotificationRecipient,
    BreederAdminReminderNotificationCommand,
} from '../application/ports/breeder-admin-notifier.port';

@Injectable()
export class BreederAdminNotifierAdapter implements BreederAdminNotifierPort {
    constructor(
        private readonly mailTemplateService: MailTemplateService,
        private readonly mailService: MailService,
        private readonly notificationService: NotificationService,
    ) {}

    async sendSuspensionEmail(recipient: BreederAdminNotificationRecipient, reason: string): Promise<void> {
        if (!recipient.emailAddress) {
            return;
        }

        const emailContent = this.mailTemplateService.getBreederSuspensionEmail(recipient.breederName, reason);
        void this.mailService
            .sendMail({
                to: recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            })
            .catch((error) => console.error('브리더 정지 이메일 발송 실패:', error));
    }

    async sendUnsuspensionEmail(recipient: BreederAdminNotificationRecipient): Promise<void> {
        if (!recipient.emailAddress) {
            return;
        }

        const emailContent = this.mailTemplateService.getBreederUnsuspensionEmail(recipient.breederName);
        void this.mailService
            .sendMail({
                to: recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            })
            .catch((error) => console.error('브리더 정지 해제 이메일 발송 실패:', error));
    }

    async sendReminder(command: BreederAdminReminderNotificationCommand): Promise<void> {
        const builder = this.notificationService
            .to(command.recipient.breederId, RecipientType.BREEDER)
            .type(command.notificationType)
            .title(command.title)
            .content(command.content)
            .targetUrl(command.targetUrl);

        if (command.recipient.emailAddress) {
            const emailContent = this.getReminderEmailContent(command);
            builder.withEmail({
                to: command.recipient.emailAddress,
                subject: emailContent.subject,
                html: emailContent.html,
            });
        }

        await builder.send();
    }

    private getReminderEmailContent(command: BreederAdminReminderNotificationCommand): { subject: string; html: string } {
        if (command.emailTemplate === 'document_reminder') {
            return this.mailTemplateService.getDocumentReminderEmail(command.recipient.breederName);
        }

        return this.mailTemplateService.getProfileCompletionReminderEmail(command.recipient.breederName);
    }
}
