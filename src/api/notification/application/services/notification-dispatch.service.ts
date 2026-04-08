import { Injectable } from '@nestjs/common';

import { Notification, NotificationType } from '../../../../schema/notification.schema';
import { NotificationBuilder, NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { RecipientType } from '../../../../common/enum/user.enum';
import { CreateNotificationUseCase } from '../use-cases/create-notification.use-case';
import { CreateNotificationFromBuilderUseCase } from '../use-cases/create-notification-from-builder.use-case';
import { SendNotificationEmailUseCase } from '../use-cases/send-notification-email.use-case';
import { NotificationDispatchPort } from '../ports/notification-dispatch.port';

@Injectable()
export class NotificationDispatchService extends NotificationDispatchPort {
    constructor(
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly createNotificationFromBuilderUseCase: CreateNotificationFromBuilderUseCase,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {
        super();
    }

    async createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: Record<string, any>,
        targetUrl?: string,
    ): Promise<Notification> {
        return this.createNotificationUseCase.execute(userId, userRole, type, metadata, targetUrl);
    }

    to(recipientId: string, recipientType: RecipientType): NotificationBuilder {
        return new NotificationBuilder(
            (data: NotificationCreateData) => this.createNotificationFromBuilder(data),
            (emailData: EmailData) => this.sendEmail(emailData),
            recipientId,
            recipientType,
        );
    }

    private async createNotificationFromBuilder(data: NotificationCreateData) {
        return this.createNotificationFromBuilderUseCase.execute(data);
    }

    private sendEmail(emailData: EmailData): boolean {
        return this.sendNotificationEmailUseCase.execute(emailData);
    }
}
