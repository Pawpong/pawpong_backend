import { Inject, Injectable } from '@nestjs/common';

import { Notification, NotificationType } from '../../../../schema/notification.schema';
import type { NotificationMetadata } from '../../../../schema/notification.schema';
import { NotificationBuilder, NotificationCreateData, EmailData } from '../../builder/notification.builder';
import { RecipientType } from '../../../../common/enum/user.enum';
import { NotificationDispatchPort } from '../ports/notification-dispatch.port';
import {
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
    SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
    type CreateNotificationDispatchUseCasePort,
    type CreateNotificationFromBuilderDispatchUseCasePort,
    type SendNotificationEmailDispatchUseCasePort,
} from '../ports/notification-dispatch-use-case.port';

@Injectable()
export class NotificationDispatchService extends NotificationDispatchPort {
    constructor(
        @Inject(CREATE_NOTIFICATION_DISPATCH_USE_CASE)
        private readonly createNotificationUseCase: CreateNotificationDispatchUseCasePort,
        @Inject(CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE)
        private readonly createNotificationFromBuilderUseCase: CreateNotificationFromBuilderDispatchUseCasePort,
        @Inject(SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE)
        private readonly sendNotificationEmailUseCase: SendNotificationEmailDispatchUseCasePort,
    ) {
        super();
    }

    async createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: NotificationMetadata,
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
