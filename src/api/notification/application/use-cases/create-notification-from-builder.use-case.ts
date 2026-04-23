import { Inject, Injectable } from '@nestjs/common';

import { RecipientType } from '../../../../common/enum/user.enum';
import { NOTIFICATION_COMMAND_PORT, NotificationUserRole } from '../ports/notification-command.port';
import type { NotificationCommandPort } from '../ports/notification-command.port';
import { NotificationItemMapperService } from '../../domain/services/notification-item-mapper.service';
import { NotificationCreateData } from '../../builder/notification.builder';
import type { NotificationItemResult } from '../types/notification-result.type';

@Injectable()
export class CreateNotificationFromBuilderUseCase {
    constructor(
        @Inject(NOTIFICATION_COMMAND_PORT)
        private readonly notificationCommandPort: NotificationCommandPort,
        private readonly notificationItemMapperService: NotificationItemMapperService,
    ) {}

    async execute(data: NotificationCreateData): Promise<NotificationItemResult> {
        const userRole: NotificationUserRole = data.recipientType === RecipientType.BREEDER ? 'breeder' : 'adopter';

        const notification = await this.notificationCommandPort.create({
            userId: data.recipientId,
            userRole,
            type: data.type,
            title: data.title,
            body: data.content,
            metadata: data.metadata,
            targetUrl: data.targetUrl,
            isRead: false,
        });

        return this.notificationItemMapperService.toItem(notification);
    }
}
