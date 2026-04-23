import { Inject, Injectable } from '@nestjs/common';

import {
    EmailData,
    NotificationBuilder,
    NotificationCreateData,
    PushDispatchData,
} from '../../builder/notification.builder';
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
import { SendNotificationPushUseCase } from '../use-cases/send-notification-push.use-case';
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
        private readonly sendNotificationPushUseCase: SendNotificationPushUseCase,
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
            (pushData: PushDispatchData) => this.sendPush(pushData),
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

    private sendPush(data: PushDispatchData): void {
        void this.sendNotificationPushUseCase.execute({
            userId: data.userId,
            userRole: data.userRole,
            message: {
                title: data.title,
                body: data.body,
                targetUrl: data.targetUrl,
                data: data.data,
            },
        });
    }
}
