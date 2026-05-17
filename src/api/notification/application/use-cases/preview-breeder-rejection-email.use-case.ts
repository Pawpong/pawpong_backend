import { Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import type { BreederRejectionEmailPreviewCommand } from '../types/notification-email-preview-command.type';
import type { NotificationEmailPreviewResult } from '../types/notification-email-preview-result.type';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class PreviewBreederRejectionEmailUseCase {
    constructor(
        private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    execute(request: BreederRejectionEmailPreviewCommand): NotificationEmailPreviewResult {
        const template = this.notificationEmailPreviewTemplateService.getBreederRejectionTemplate(
            request.breederName,
            request.rejectionReasons,
        );
        const emailData: EmailData = {
            to: request.email,
            subject: template.subject,
            html: template.html,
        };

        return {
            recipient: request.email,
            subject: template.subject,
            preview: template.html,
            sent: this.sendNotificationEmailUseCase.execute(emailData),
        };
    }
}
