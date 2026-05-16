import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { Notification, NotificationSchema } from '../../../schema/notification.schema';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { NotificationModule } from '../notification.module';

import { ADMIN_PUSH_RECIPIENT_READER_PORT } from './application/ports/admin-push-recipient-reader.port';
import { NOTIFICATION_ADMIN_READER_PORT } from './application/ports/notification-admin-reader.port';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import { SendAdminPushUseCase } from './application/use-cases/send-admin-push.use-case';
import { AdminPushTargetValidatorService } from './domain/services/admin-push-target-validator.service';
import { NotificationAdminItemMapperService } from './domain/services/notification-admin-item-mapper.service';
import { NotificationAdminPageAssemblerService } from './domain/services/notification-admin-page-assembler.service';
import { NotificationAdminPaginationAssemblerService } from './domain/services/notification-admin-pagination-assembler.service';
import { NotificationAdminStatsResultMapperService } from './domain/services/notification-admin-stats-result-mapper.service';
import { AdminPushRecipientMongooseAdapter } from './infrastructure/admin-push-recipient-mongoose.adapter';
import { NotificationAdminMongooseReaderAdapter } from './infrastructure/notification-admin-mongoose-reader.adapter';
import { NotificationAdminPushSendController } from './controller/notification-admin-push-send.controller';
import { NotificationAdminQueryController } from './controller/notification-admin-query.controller';
import { NotificationAdminStatsController } from './controller/notification-admin-stats.controller';
import { AdminPushRecipientRepository } from './repository/admin-push-recipient.repository';
import { NotificationAdminRepository } from './repository/notification-admin.repository';

const NOTIFICATION_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: Breeder.name, schema: BreederSchema },
]);

// NotificationModule 이 NOTIFICATION_PUSH_PORT, NOTIFICATION_COMMAND_PORT 를 export 하므로
// SendAdminPushUseCase 가 두 port 를 주입받을 수 있다.
export const NOTIFICATION_ADMIN_MODULE_IMPORTS = [NOTIFICATION_ADMIN_SCHEMA_IMPORTS, NotificationModule];

export const NOTIFICATION_ADMIN_MODULE_CONTROLLERS = [
    NotificationAdminQueryController,
    NotificationAdminStatsController,
    NotificationAdminPushSendController,
];

const NOTIFICATION_ADMIN_USE_CASE_PROVIDERS = [
    GetAdminNotificationsUseCase,
    GetNotificationAdminStatsUseCase,
    SendAdminPushUseCase,
];

const NOTIFICATION_ADMIN_DOMAIN_PROVIDERS = [
    NotificationAdminPaginationAssemblerService,
    NotificationAdminItemMapperService,
    NotificationAdminPageAssemblerService,
    NotificationAdminStatsResultMapperService,
    AdminPushTargetValidatorService,
];

const NOTIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    NotificationAdminRepository,
    NotificationAdminMongooseReaderAdapter,
    AdminPushRecipientRepository,
    AdminPushRecipientMongooseAdapter,
];

const NOTIFICATION_ADMIN_PORT_BINDINGS = [
    {
        provide: NOTIFICATION_ADMIN_READER_PORT,
        useExisting: NotificationAdminMongooseReaderAdapter,
    },
    {
        provide: ADMIN_PUSH_RECIPIENT_READER_PORT,
        useExisting: AdminPushRecipientMongooseAdapter,
    },
];

export const NOTIFICATION_ADMIN_MODULE_PROVIDERS = [
    ...NOTIFICATION_ADMIN_USE_CASE_PROVIDERS,
    ...NOTIFICATION_ADMIN_DOMAIN_PROVIDERS,
    ...NOTIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...NOTIFICATION_ADMIN_PORT_BINDINGS,
];
