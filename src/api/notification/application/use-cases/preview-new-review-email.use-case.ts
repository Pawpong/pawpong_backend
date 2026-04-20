import { Injectable } from '@nestjs/common';

import { EmailData } from '../../builder/notification.builder';
import { NewReviewEmailPreviewRequestDto } from '../../dto/request/notification-email-preview-request.dto';
import { NotificationEmailPreviewResponseDto } from '../../dto/response/notification-email-preview-response.dto';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class PreviewNewReviewEmailUseCase {
    constructor(
        private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    execute(request: NewReviewEmailPreviewRequestDto): NotificationEmailPreviewResponseDto {
        const template = this.notificationEmailPreviewTemplateService.getNewReviewTemplate(request.breederName);
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
