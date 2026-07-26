import { Injectable } from '@nestjs/common';

import type { NotificationEmailPreviewType } from '../../constants/notification-email-preview.constants';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';

@Injectable()
export class RenderNotificationEmailPreviewUseCase {
    constructor(private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService) {}

    execute(type?: NotificationEmailPreviewType): string {
        return this.notificationEmailPreviewTemplateService.renderTemplate(type);
    }
}
