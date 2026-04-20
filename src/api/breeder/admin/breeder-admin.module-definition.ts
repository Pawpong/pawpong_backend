import { MongooseModule } from '@nestjs/mongoose';

import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { AlimtalkModule } from '../../../common/alimtalk/alimtalk.module';
import { MailModule } from '../../../common/mail/mail.module';
import { StorageModule } from '../../../common/storage/storage.module';
import { NotificationModule } from '../../../api/notification/notification.module';

import { BREEDER_ADMIN_NOTIFIER_PORT } from './application/ports/breeder-admin-notifier.port';
import { BREEDER_ADMIN_READER_PORT } from './application/ports/breeder-admin-reader.port';
import { BREEDER_ADMIN_WRITER_PORT } from './application/ports/breeder-admin-writer.port';
import { SendBreederRemindNotificationsUseCase } from './application/use-cases/send-breeder-remind-notifications.use-case';
import { SetBreederTestAccountUseCase } from './application/use-cases/set-breeder-test-account.use-case';
import { SuspendBreederUseCase } from './application/use-cases/suspend-breeder.use-case';
import { UnsuspendBreederUseCase } from './application/use-cases/unsuspend-breeder.use-case';
import { BreederAdminAccountController } from './breeder-admin-account.controller';
import { BreederAdminReminderController } from './breeder-admin-reminder.controller';
import { BreederAdminActivityLogFactoryService } from './domain/services/breeder-admin-activity-log-factory.service';
import { BreederAdminPolicyService } from './domain/services/breeder-admin-policy.service';
import { BreederAdminReminderPolicyService } from './domain/services/breeder-admin-reminder-policy.service';
import { BreederAdminReminderResultMapperService } from './domain/services/breeder-admin-reminder-result-mapper.service';
import { BreederAdminSuspensionResultMapperService } from './domain/services/breeder-admin-suspension-result-mapper.service';
import { BreederAdminTestAccountResultMapperService } from './domain/services/breeder-admin-test-account-result-mapper.service';
import { BreederAdminMongooseRepositoryAdapter } from './infrastructure/breeder-admin-mongoose.repository.adapter';
import { BreederAdminNotifierAdapter } from './infrastructure/breeder-admin-notifier.adapter';
import { BreederReportAdminModule } from './report/breeder-report-admin.module';
import { BreederAdminRepository } from './repository/breeder-admin.repository';
import { BreederVerificationAdminModule } from './verification/breeder-verification-admin.module';

const BREEDER_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Admin.name, schema: AdminSchema },
]);

export const BREEDER_ADMIN_MODULE_IMPORTS = [
    BREEDER_ADMIN_SCHEMA_IMPORTS,
    StorageModule,
    MailModule,
    NotificationModule,
    AlimtalkModule,
    BreederReportAdminModule,
    BreederVerificationAdminModule,
];

export const BREEDER_ADMIN_MODULE_CONTROLLERS = [
    BreederAdminAccountController,
    BreederAdminReminderController,
];

const BREEDER_ADMIN_USE_CASE_PROVIDERS = [
    SuspendBreederUseCase,
    UnsuspendBreederUseCase,
    SendBreederRemindNotificationsUseCase,
    SetBreederTestAccountUseCase,
];

const BREEDER_ADMIN_DOMAIN_PROVIDERS = [
    BreederAdminPolicyService,
    BreederAdminActivityLogFactoryService,
    BreederAdminSuspensionResultMapperService,
    BreederAdminReminderResultMapperService,
    BreederAdminTestAccountResultMapperService,
    BreederAdminReminderPolicyService,
];

const BREEDER_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    BreederAdminRepository,
    BreederAdminMongooseRepositoryAdapter,
    BreederAdminNotifierAdapter,
];

const BREEDER_ADMIN_PORT_BINDINGS = [
    {
        provide: BREEDER_ADMIN_READER_PORT,
        useExisting: BreederAdminMongooseRepositoryAdapter,
    },
    {
        provide: BREEDER_ADMIN_WRITER_PORT,
        useExisting: BreederAdminMongooseRepositoryAdapter,
    },
    {
        provide: BREEDER_ADMIN_NOTIFIER_PORT,
        useExisting: BreederAdminNotifierAdapter,
    },
];

export const BREEDER_ADMIN_MODULE_PROVIDERS = [
    ...BREEDER_ADMIN_USE_CASE_PROVIDERS,
    ...BREEDER_ADMIN_DOMAIN_PROVIDERS,
    ...BREEDER_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_ADMIN_PORT_BINDINGS,
];

export const BREEDER_ADMIN_MODULE_EXPORTS = [BreederReportAdminModule, BreederVerificationAdminModule];
