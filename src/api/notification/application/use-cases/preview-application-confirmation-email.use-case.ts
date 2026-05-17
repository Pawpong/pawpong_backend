import { Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import type { ApplicationConfirmationEmailPreviewCommand } from '../types/notification-email-preview-command.type';
import type { NotificationEmailPreviewResult } from '../types/notification-email-preview-result.type';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class PreviewApplicationConfirmationEmailUseCase {
    constructor(
        private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    execute(command: ApplicationConfirmationEmailPreviewCommand): NotificationEmailPreviewResult {
        const template = this.notificationEmailPreviewTemplateService.getApplicationConfirmationTemplate(
            command.applicantName,
            command.breederName,
        );
        const emailData: EmailData = {
            to: command.email,
            subject: template.subject,
            html: template.html,
        };

        return {
            recipient: command.email,
            subject: template.subject,
            preview: template.html,
            sent: this.sendNotificationEmailUseCase.execute(emailData),
        };
    }
}
