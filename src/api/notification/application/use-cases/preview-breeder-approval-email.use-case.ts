import { Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import type { BreederApprovalEmailPreviewCommand } from '../types/notification-email-preview-command.type';
import { NotificationEmailPreviewResponseDto } from '../../dto/response/notification-email-preview-response.dto';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class PreviewBreederApprovalEmailUseCase {
    constructor(
        private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    execute(request: BreederApprovalEmailPreviewCommand): NotificationEmailPreviewResponseDto {
        const template = this.notificationEmailPreviewTemplateService.getBreederApprovalTemplate(request.breederName);
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
