import { MongooseModule } from '@nestjs/mongoose';

import { Notification, NotificationSchema } from '../../../schema/notification.schema';
import { CustomLoggerService } from '../../../common/logger/custom-logger.service';

import { NOTIFICATION_ADMIN_READER_PORT } from './application/ports/notification-admin-reader.port';
import { GetAdminNotificationsUseCase } from './application/use-cases/get-admin-notifications.use-case';
import { GetNotificationAdminStatsUseCase } from './application/use-cases/get-notification-admin-stats.use-case';
import { NotificationAdminQueryController } from './notification-admin-query.controller';
import { NotificationAdminStatsController } from './notification-admin-stats.controller';
import { NotificationAdminItemMapperService } from './domain/services/notification-admin-item-mapper.service';
import { NotificationAdminPageAssemblerService } from './domain/services/notification-admin-page-assembler.service';
import { NotificationAdminPaginationAssemblerService } from './domain/services/notification-admin-pagination-assembler.service';
import { NotificationAdminStatsResultMapperService } from './domain/services/notification-admin-stats-result-mapper.service';
import { NotificationAdminMongooseReaderAdapter } from './infrastructure/notification-admin-mongoose-reader.adapter';
import { NotificationAdminRepository } from './repository/notification-admin.repository';

const NOTIFICATION_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Notification.name, schema: NotificationSchema },
]);

export const NOTIFICATION_ADMIN_MODULE_IMPORTS = [NOTIFICATION_ADMIN_SCHEMA_IMPORTS];

export const NOTIFICATION_ADMIN_MODULE_CONTROLLERS = [
    NotificationAdminQueryController,
    NotificationAdminStatsController,
];

const NOTIFICATION_ADMIN_USE_CASE_PROVIDERS = [
    GetAdminNotificationsUseCase,
    GetNotificationAdminStatsUseCase,
];

const NOTIFICATION_ADMIN_DOMAIN_PROVIDERS = [
    NotificationAdminPaginationAssemblerService,
    NotificationAdminItemMapperService,
    NotificationAdminPageAssemblerService,
    NotificationAdminStatsResultMapperService,
];

const NOTIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    NotificationAdminRepository,
    NotificationAdminMongooseReaderAdapter,
];

const NOTIFICATION_ADMIN_PORT_BINDINGS = [
    {
        provide: NOTIFICATION_ADMIN_READER_PORT,
        useExisting: NotificationAdminMongooseReaderAdapter,
    },
];

export const NOTIFICATION_ADMIN_MODULE_PROVIDERS = [
    ...NOTIFICATION_ADMIN_USE_CASE_PROVIDERS,
    ...NOTIFICATION_ADMIN_DOMAIN_PROVIDERS,
    ...NOTIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...NOTIFICATION_ADMIN_PORT_BINDINGS,
];
