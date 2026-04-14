import { Inject, Injectable } from '@nestjs/common';

import { EmailData, NotificationBuilder, NotificationCreateData } from '../../builder/notification.builder';
import { NotificationType, RecipientType } from '../../../../common/enum/user.enum';
import { type NotificationDispatchPort } from '../ports/notification-dispatch.port';
import type {
    CreateNotificationDispatchUseCasePort,
    CreateNotificationFromBuilderDispatchUseCasePort,
    SendNotificationEmailDispatchUseCasePort,
} from '../ports/notification-dispatch-use-case.port';
import {
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
    SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
} from '../tokens/notification-dispatch-use-case.token';
import type { NotificationDocumentRecord } from '../../types/notification-record.type';
import type { NotificationMetadata } from '../../types/notification-metadata.type';

@Injectable()
export class NotificationDispatchService implements NotificationDispatchPort {
    constructor(
        @Inject(CREATE_NOTIFICATION_DISPATCH_USE_CASE)
        private readonly createNotificationUseCase: CreateNotificationDispatchUseCasePort,
        @Inject(CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE)
        private readonly createNotificationFromBuilderUseCase: CreateNotificationFromBuilderDispatchUseCasePort,
        @Inject(SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE)
        private readonly sendNotificationEmailUseCase: SendNotificationEmailDispatchUseCasePort,
    ) {}

    async createNotification(
        userId: string,
        userRole: 'adopter' | 'breeder',
        type: NotificationType,
        metadata?: NotificationMetadata,
        targetUrl?: string,
    ): Promise<NotificationDocumentRecord> {
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
