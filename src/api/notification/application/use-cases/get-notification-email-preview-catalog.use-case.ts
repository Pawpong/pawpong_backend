import { Injectable } from '@nestjs/common';

import { NotificationEmailPreviewCatalogResponseDto } from '../../dto/response/notification-email-preview-response.dto';
import { NotificationEmailPreviewTemplateService } from '../services/notification-email-preview-template.service';

@Injectable()
export class GetNotificationEmailPreviewCatalogUseCase {
    constructor(private readonly notificationEmailPreviewTemplateService: NotificationEmailPreviewTemplateService) {}

    execute(): NotificationEmailPreviewCatalogResponseDto {
        return this.notificationEmailPreviewTemplateService.getPreviewCatalog();
    }
}
