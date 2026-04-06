import { Inject, Injectable } from '@nestjs/common';

import { RecipientType } from '../../../../common/enum/user.enum';
import {
    NOTIFICATION_COMMAND_PORT,
    NotificationUserRole,
} from '../ports/notification-command.port';
import type { NotificationCommandPort } from '../ports/notification-command.port';
import { NotificationResponseMapperService } from '../../domain/services/notification-response-mapper.service';
import { NotificationCreateData } from '../../builder/notification.builder';
import { NotificationResponseDto } from '../../dto/response/notification-response.dto';

@Injectable()
export class CreateNotificationFromBuilderUseCase {
    constructor(
        @Inject(NOTIFICATION_COMMAND_PORT)
        private readonly notificationCommandPort: NotificationCommandPort,
        private readonly notificationResponseMapperService: NotificationResponseMapperService,
    ) {}

    async execute(data: NotificationCreateData): Promise<NotificationResponseDto> {
        const userRole: NotificationUserRole =
            data.recipientType === RecipientType.BREEDER ? 'breeder' : 'adopter';

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

        return this.notificationResponseMapperService.toItem(notification);
    }
}
