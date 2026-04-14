import { MongooseModule } from '@nestjs/mongoose';

import { Notification, NotificationSchema } from '../../schema/notification.schema';
import { MailModule } from '../../common/mail/mail.module';

import { NotificationDeleteController } from './notification-delete.controller';
import { NotificationEmailPreviewController } from './notification-email-preview.controller';
import { NotificationListController } from './notification-list.controller';
import { NotificationMarkAllReadController } from './notification-mark-all-read.controller';
import { NotificationMarkReadController } from './notification-mark-read.controller';
import { NotificationUnreadCountController } from './notification-unread-count.controller';
import { NOTIFICATION_COMMAND_PORT } from './application/ports/notification-command.port';
import { NOTIFICATION_DISPATCH_PORT } from './application/ports/notification-dispatch.port';
import { NOTIFICATION_EMAIL_PORT } from './application/ports/notification-email.port';
import { NOTIFICATION_INBOX_PORT } from './application/ports/notification-inbox.port';
import { NotificationDispatchService } from './application/services/notification-dispatch.service';
import {
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
    SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
} from './application/tokens/notification-dispatch-use-case.token';
import { CreateNotificationFromBuilderUseCase } from './application/use-cases/create-notification-from-builder.use-case';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { NotificationItemMapperService } from './domain/services/notification-item-mapper.service';
import { NotificationMessageTemplateService } from './domain/services/notification-message-template.service';
import { NotificationPageAssemblerService } from './domain/services/notification-page-assembler.service';
import { NotificationPaginationAssemblerService } from './domain/services/notification-pagination-assembler.service';
import { NotificationStateResultMapperService } from './domain/services/notification-state-result-mapper.service';
import { NotificationMailAdapter } from './infrastructure/notification-mail.adapter';
import { NotificationMongooseCommandAdapter } from './infrastructure/notification-mongoose-command.adapter';
import { NotificationMongooseInboxAdapter } from './infrastructure/notification-mongoose-inbox.adapter';
import { NotificationRepository } from './repository/notification.repository';

const NOTIFICATION_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]);

export const NOTIFICATION_MODULE_IMPORTS = [NOTIFICATION_SCHEMA_IMPORTS, MailModule];

export const NOTIFICATION_MODULE_CONTROLLERS = [
    NotificationListController,
    NotificationUnreadCountController,
    NotificationMarkReadController,
    NotificationMarkAllReadController,
    NotificationDeleteController,
    NotificationEmailPreviewController,
];

const NOTIFICATION_USE_CASE_PROVIDERS = [
    CreateNotificationUseCase,
    CreateNotificationFromBuilderUseCase,
    GetNotificationsUseCase,
    GetUnreadNotificationCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
    DeleteNotificationUseCase,
    SendNotificationEmailUseCase,
];

const NOTIFICATION_APPLICATION_PROVIDERS = [NotificationDispatchService];

const NOTIFICATION_DOMAIN_PROVIDERS = [
    NotificationItemMapperService,
    NotificationPageAssemblerService,
    NotificationPaginationAssemblerService,
    NotificationMessageTemplateService,
    NotificationStateResultMapperService,
];

const NOTIFICATION_INFRASTRUCTURE_PROVIDERS = [
    NotificationRepository,
    NotificationMongooseInboxAdapter,
    NotificationMongooseCommandAdapter,
    NotificationMailAdapter,
];

const NOTIFICATION_PORT_BINDINGS = [
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
    {
        provide: CREATE_NOTIFICATION_DISPATCH_USE_CASE,
        useExisting: CreateNotificationUseCase,
    },
    {
        provide: CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
        useExisting: CreateNotificationFromBuilderUseCase,
    },
    {
        provide: SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
        useExisting: SendNotificationEmailUseCase,
    },
    {
        provide: NOTIFICATION_DISPATCH_PORT,
        useExisting: NotificationDispatchService,
    },
];

export const NOTIFICATION_MODULE_PROVIDERS = [
    ...NOTIFICATION_USE_CASE_PROVIDERS,
    ...NOTIFICATION_APPLICATION_PROVIDERS,
    ...NOTIFICATION_DOMAIN_PROVIDERS,
    ...NOTIFICATION_INFRASTRUCTURE_PROVIDERS,
    ...NOTIFICATION_PORT_BINDINGS,
];

export const NOTIFICATION_MODULE_EXPORTS = [NOTIFICATION_DISPATCH_PORT];
