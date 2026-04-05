import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EmailTestController } from './test/email-test.controller';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { NotificationResponseMapperService } from './domain/services/notification-response-mapper.service';
import { NotificationMongooseInboxAdapter } from './infrastructure/notification-mongoose-inbox.adapter';
import { NOTIFICATION_INBOX_PORT } from './application/ports/notification-inbox.port';

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
    controllers: [NotificationController, EmailTestController],
    providers: [
        NotificationService,
        NotificationResponseMapperService,
        NotificationMongooseInboxAdapter,
        GetNotificationsUseCase,
        GetUnreadNotificationCountUseCase,
        MarkNotificationReadUseCase,
        MarkAllNotificationsReadUseCase,
        DeleteNotificationUseCase,
        {
            provide: NOTIFICATION_INBOX_PORT,
            useExisting: NotificationMongooseInboxAdapter,
        },
    ],
    exports: [NotificationService, MailModule], // MailModule re-export
})
export class NotificationModule {}
