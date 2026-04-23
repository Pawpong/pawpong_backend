import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../schema/breeder.schema';
import { Notification, NotificationSchema } from '../../schema/notification.schema';
import { MailModule } from '../../common/mail/mail.module';

import { NotificationDeleteController } from './notification-delete.controller';
import { NotificationEmailPreviewController } from './notification-email-preview.controller';
import { NotificationListController } from './notification-list.controller';
import { NotificationMarkAllReadController } from './notification-mark-all-read.controller';
import { NotificationMarkReadController } from './notification-mark-read.controller';
import { NotificationPushTokenController } from './notification-push-token.controller';
import { NotificationUnreadCountController } from './notification-unread-count.controller';
import { NOTIFICATION_COMMAND_PORT } from './application/ports/notification-command.port';
import { NOTIFICATION_DISPATCH_PORT } from './application/ports/notification-dispatch.port';
import { NOTIFICATION_EMAIL_PORT } from './application/ports/notification-email.port';
import { NOTIFICATION_INBOX_PORT } from './application/ports/notification-inbox.port';
import { NOTIFICATION_PUSH_PORT } from './application/ports/notification-push.port';
import { NOTIFICATION_PUSH_TOKEN_STORE_PORT } from './application/ports/notification-push-token-store.port';
import { NotificationEmailPreviewTemplateService } from './application/services/notification-email-preview-template.service';
import { NotificationDispatchService } from './application/services/notification-dispatch.service';
import {
    CREATE_NOTIFICATION_DISPATCH_USE_CASE,
    CREATE_NOTIFICATION_FROM_BUILDER_DISPATCH_USE_CASE,
    SEND_NOTIFICATION_EMAIL_DISPATCH_USE_CASE,
} from './application/tokens/notification-dispatch-use-case.token';
import { CreateNotificationFromBuilderUseCase } from './application/use-cases/create-notification-from-builder.use-case';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { GetNotificationEmailPreviewCatalogUseCase } from './application/use-cases/get-notification-email-preview-catalog.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/mark-all-notifications-read.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/mark-notification-read.use-case';
import { PreviewApplicationConfirmationEmailUseCase } from './application/use-cases/preview-application-confirmation-email.use-case';
import { PreviewBreederApprovalEmailUseCase } from './application/use-cases/preview-breeder-approval-email.use-case';
import { PreviewBreederRejectionEmailUseCase } from './application/use-cases/preview-breeder-rejection-email.use-case';
import { PreviewDocumentReminderEmailUseCase } from './application/use-cases/preview-document-reminder-email.use-case';
import { PreviewNewApplicationEmailUseCase } from './application/use-cases/preview-new-application-email.use-case';
import { PreviewNewReviewEmailUseCase } from './application/use-cases/preview-new-review-email.use-case';
import { RegisterPushDeviceTokenUseCase } from './application/use-cases/register-push-device-token.use-case';
import { RenderNotificationEmailPreviewUseCase } from './application/use-cases/render-notification-email-preview.use-case';
import { SendNotificationEmailUseCase } from './application/use-cases/send-notification-email.use-case';
import { SendNotificationPushUseCase } from './application/use-cases/send-notification-push.use-case';
import { UnregisterPushDeviceTokenUseCase } from './application/use-cases/unregister-push-device-token.use-case';
import { NotificationItemMapperService } from './domain/services/notification-item-mapper.service';
import { NotificationMessageTemplateService } from './domain/services/notification-message-template.service';
import { NotificationPageAssemblerService } from './domain/services/notification-page-assembler.service';
import { NotificationPaginationAssemblerService } from './domain/services/notification-pagination-assembler.service';
import { NotificationStateResultMapperService } from './domain/services/notification-state-result-mapper.service';
import { NotificationFirebasePushAdapter } from './infrastructure/notification-firebase-push.adapter';
import { NotificationMailAdapter } from './infrastructure/notification-mail.adapter';
import { NotificationMongooseCommandAdapter } from './infrastructure/notification-mongoose-command.adapter';
import { NotificationMongooseInboxAdapter } from './infrastructure/notification-mongoose-inbox.adapter';
import { NotificationPushTokenMongooseAdapter } from './infrastructure/notification-push-token-mongoose.adapter';
import { NotificationRepository } from './repository/notification.repository';

const NOTIFICATION_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

export const NOTIFICATION_MODULE_IMPORTS = [NOTIFICATION_SCHEMA_IMPORTS, MailModule];

export const NOTIFICATION_MODULE_CONTROLLERS = [
    NotificationListController,
    NotificationUnreadCountController,
    NotificationMarkReadController,
    NotificationMarkAllReadController,
    NotificationDeleteController,
    NotificationEmailPreviewController,
    NotificationPushTokenController,
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
    PreviewBreederApprovalEmailUseCase,
    PreviewBreederRejectionEmailUseCase,
    PreviewNewApplicationEmailUseCase,
    PreviewDocumentReminderEmailUseCase,
    PreviewApplicationConfirmationEmailUseCase,
    PreviewNewReviewEmailUseCase,
    GetNotificationEmailPreviewCatalogUseCase,
    RenderNotificationEmailPreviewUseCase,
    RegisterPushDeviceTokenUseCase,
    UnregisterPushDeviceTokenUseCase,
    SendNotificationPushUseCase,
];

const NOTIFICATION_APPLICATION_PROVIDERS = [NotificationDispatchService, NotificationEmailPreviewTemplateService];

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
    NotificationFirebasePushAdapter,
    NotificationPushTokenMongooseAdapter,
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
    {
        provide: NOTIFICATION_PUSH_PORT,
        useExisting: NotificationFirebasePushAdapter,
    },
    {
        provide: NOTIFICATION_PUSH_TOKEN_STORE_PORT,
        useExisting: NotificationPushTokenMongooseAdapter,
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
