import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailTestController } from './test/email-test.controller';
import { NotificationCommandController } from './notification-command.controller';
import { NotificationQueryController } from './notification-query.controller';
import { NotificationService } from './notification.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { CreateNotificationFromBuilderUseCase } from './application/use-cases/create-notification-from-builder.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { NotificationResponseMapperService } from './domain/services/notification-response-mapper.service';
import { NotificationMessageTemplateService } from './domain/services/notification-message-template.service';
import { NotificationMongooseInboxAdapter } from './infrastructure/notification-mongoose-inbox.adapter';
import { NotificationMongooseCommandAdapter } from './infrastructure/notification-mongoose-command.adapter';
import { NotificationMailAdapter } from './infrastructure/notification-mail.adapter';
import { NOTIFICATION_INBOX_PORT } from './application/ports/notification-inbox.port';
import { NOTIFICATION_COMMAND_PORT } from './application/ports/notification-command.port';
import { NOTIFICATION_EMAIL_PORT } from './application/ports/notification-email.port';

import { Notification, NotificationSchema } from '../../schema/notification.schema';

import { MailModule } from '../../common/mail/mail.module';

/**
 * 알림 모듈
 *
 * 서비스 알림 및 이메일 발송 기능을 통합 제공합니다.
 * MailModule을 re-export하여 다른 모듈이 MailService와 MailTemplateService를 사용할 수 있도록 합니다.
 */
@Module({
    imports: [MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]), MailModule],
    controllers: [NotificationQueryController, NotificationCommandController, EmailTestController],
    providers: [
        NotificationService,
        CreateNotificationUseCase,
        CreateNotificationFromBuilderUseCase,
        NotificationResponseMapperService,
        NotificationMessageTemplateService,
        NotificationMongooseInboxAdapter,
        NotificationMongooseCommandAdapter,
        NotificationMailAdapter,
        GetNotificationsUseCase,
        GetUnreadNotificationCountUseCase,
        MarkNotificationReadUseCase,
        MarkAllNotificationsReadUseCase,
        DeleteNotificationUseCase,
        SendNotificationEmailUseCase,
        {
            provide: NOTIFICATION_INBOX_PORT,
            useExisting: NotificationMongooseInboxAdapter,
        },
        {
            provide: NOTIFICATION_COMMAND_PORT,
            useExisting: NotificationMongooseCommandAdapter,
        },
        {
            provide: NOTIFICATION_EMAIL_PORT,
            useExisting: NotificationMailAdapter,
        },
    ],
    exports: [NotificationService, MailModule], // MailModule re-export
})
export class NotificationModule {}
