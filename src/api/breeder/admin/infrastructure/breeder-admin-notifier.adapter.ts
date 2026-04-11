import { Inject, Injectable, Logger } from '@nestjs/common';

import { RecipientType } from '../../../../common/enum/user.enum';
import { MailService } from '../../../../common/mail/mail.service';
import { MailTemplateService } from '../../../../common/mail/mail-template.service';
import { getErrorStack } from '../../../../common/utils/error.util';
import {
    NOTIFICATION_DISPATCH_PORT,
    type NotificationDispatchPort,
} from '../../../../api/notification/application/ports/notification-dispatch.port';
import {
    BreederAdminNotifierPort,
    BreederAdminNotificationRecipient,
    BreederAdminReminderNotificationCommand,
} from '../application/ports/breeder-admin-notifier.port';

@Injectable()
export class BreederAdminNotifierAdapter implements BreederAdminNotifierPort {
    private readonly logger = new Logger(BreederAdminNotifierAdapter.name);

    constructor(
        private readonly mailTemplateService: MailTemplateService,
        private readonly mailService: MailService,
        @Inject(NOTIFICATION_DISPATCH_PORT)
        private readonly notificationDispatchPort: NotificationDispatchPort,
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
            .catch((error: unknown) => this.logger.error('브리더 정지 이메일 발송 실패', getErrorStack(error)));
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
            .catch((error: unknown) => this.logger.error('브리더 정지 해제 이메일 발송 실패', getErrorStack(error)));
    }

    async sendReminder(command: BreederAdminReminderNotificationCommand): Promise<void> {
        const builder = this.notificationDispatchPort
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
