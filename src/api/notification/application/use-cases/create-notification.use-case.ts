import { Inject, Injectable } from '@nestjs/common';

import { NotificationType } from '../../../../common/enum/user.enum';
import {
    NOTIFICATION_COMMAND_PORT,
    NotificationUserRole,
} from '../ports/notification-command.port';
import type { NotificationCommandPort } from '../ports/notification-command.port';
import { NotificationMessageTemplateService } from '../../domain/services/notification-message-template.service';
import type { NotificationDocumentRecord } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

@Injectable()
export class CreateNotificationUseCase {
    constructor(
        @Inject(NOTIFICATION_COMMAND_PORT)
        private readonly notificationCommandPort: NotificationCommandPort,
        private readonly notificationMessageTemplateService: NotificationMessageTemplateService,
    ) {}

    async execute(
        userId: string,
        userRole: NotificationUserRole,
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<NotificationDocumentRecord> {
        const message = this.notificationMessageTemplateService.render(type, metadata);

        return this.notificationCommandPort.create({
            userId,
            userRole,
            type,
            title: message.title,
            body: message.body,
            metadata,
            targetUrl,
            isRead: false,
        });
    }
}
