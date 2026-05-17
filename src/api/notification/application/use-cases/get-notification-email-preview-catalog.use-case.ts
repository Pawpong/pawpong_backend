import { Injectable } from '@nestjs/common';

import type { NotificationEmailPreviewCatalogResult } from '../types/notification-email-preview-result.type';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';

@Injectable()
export class GetNotificationEmailPreviewCatalogUseCase {
    constructor(private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService) {}

    execute(): NotificationEmailPreviewCatalogResult {
        return this.notificationEmailPreviewTemplateService.getPreviewCatalog();
    }
}
