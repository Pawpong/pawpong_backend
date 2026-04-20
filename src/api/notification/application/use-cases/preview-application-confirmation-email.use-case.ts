import { Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import { ApplicationConfirmationEmailPreviewRequestDto } from '../../dto/request/notification-email-preview-request.dto';
import { NotificationEmailPreviewResponseDto } from '../../dto/response/notification-email-preview-response.dto';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class PreviewApplicationConfirmationEmailUseCase {
    constructor(
        private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    execute(request: ApplicationConfirmationEmailPreviewRequestDto): NotificationEmailPreviewResponseDto {
        const template = this.notificationEmailPreviewTemplateService.getApplicationConfirmationTemplate(
            request.applicantName,
            request.breederName,
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
