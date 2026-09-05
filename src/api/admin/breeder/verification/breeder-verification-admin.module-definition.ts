import { MongooseModule } from '@nestjs/mongoose';

import { Admin, AdminSchema } from '../../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../../schema/breeder.schema';
import { MailModule } from '../../../../common/mail/mail.module';
import { StorageModule } from '../../../../common/storage/storage.module';
import { NotificationModule } from '../../../service/notification/notification.module';
import { BreederPaginationAssemblerService } from '../../../service/breeder/domain/services/breeder-pagination-assembler.service';

import { BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT } from './application/ports/breeder-verification-admin-file-url.port';
import { BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT } from './application/ports/breeder-verification-admin-notifier.port';
import { BREEDER_VERIFICATION_ADMIN_READER_PORT } from './application/ports/breeder-verification-admin-reader.port';
import { BREEDER_VERIFICATION_ADMIN_WRITER_PORT } from './application/ports/breeder-verification-admin-writer.port';
import { GetBreederDetailUseCase } from './application/use-cases/get-breeder-detail.use-case';
import { GetBreederStatsUseCase } from './application/use-cases/get-breeder-stats.use-case';
import { GetBreedersUseCase } from './application/use-cases/get-breeders.use-case';
import { GetPendingBreederVerificationsUseCase } from './application/use-cases/get-pending-breeder-verifications.use-case';
import { SendDocumentRemindersUseCase } from './application/use-cases/send-document-reminders.use-case';
import { UpdateBreederVerificationUseCase } from './application/use-cases/update-breeder-verification.use-case';
import { BreederVerificationAdminCommandController } from './controller/breeder-verification-admin-command.controller';
import { BreederVerificationAdminDetailController } from './controller/breeder-verification-admin-detail.controller';
import { BreederVerificationAdminQueryController } from './controller/breeder-verification-admin-query.controller';
import { BreederVerificationAdminActivityLogFactoryService } from './domain/services/breeder-verification-admin-activity-log-factory.service';
import { BreederVerificationAdminBreederItemMapperService } from './domain/services/breeder-verification-admin-breeder-item-mapper.service';
import { BreederVerificationAdminCommandResultMapperService } from './domain/services/breeder-verification-admin-command-result-mapper.service';
import { BreederVerificationAdminDetailMapperService } from './domain/services/breeder-verification-admin-detail-mapper.service';
import { BreederVerificationAdminListItemMapperService } from './domain/services/breeder-verification-admin-list-item-mapper.service';
import { BreederVerificationAdminPendingBreederItemMapperService } from './domain/services/breeder-verification-admin-pending-breeder-item-mapper.service';
import { BreederVerificationAdminPolicyService } from './domain/services/breeder-verification-admin-policy.service';
import { BreederVerificationAdminStatsResultMapperService } from './domain/services/breeder-verification-admin-stats-result-mapper.service';
import { BreederVerificationAdminFileUrlAdapter } from './infrastructure/breeder-verification-admin-file-url.adapter';
import { BreederVerificationAdminMongooseRepositoryAdapter } from './infrastructure/breeder-verification-admin-mongoose.repository.adapter';
import { BreederVerificationAdminNotifierAdapter } from './infrastructure/breeder-verification-admin-notifier.adapter';
import { BreederVerificationAdminRepository } from './repository/breeder-verification-admin.repository';

const BREEDER_VERIFICATION_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Breeder.name, schema: BreederSchema },
    { name: Admin.name, schema: AdminSchema },
]);

export const BREEDER_VERIFICATION_ADMIN_MODULE_IMPORTS = [
    BREEDER_VERIFICATION_ADMIN_SCHEMA_IMPORTS,
    MailModule,
    NotificationModule,
    StorageModule,
];

export const BREEDER_VERIFICATION_ADMIN_MODULE_CONTROLLERS = [
    BreederVerificationAdminQueryController,
    BreederVerificationAdminDetailController,
    BreederVerificationAdminCommandController,
];

const BREEDER_VERIFICATION_ADMIN_USE_CASE_PROVIDERS = [
    GetPendingBreederVerificationsUseCase,
    GetBreedersUseCase,
    UpdateBreederVerificationUseCase,
    GetBreederDetailUseCase,
    GetBreederStatsUseCase,
    SendDocumentRemindersUseCase,
];

const BREEDER_VERIFICATION_ADMIN_DOMAIN_PROVIDERS = [
    BreederVerificationAdminPolicyService,
    BreederVerificationAdminActivityLogFactoryService,
    BreederPaginationAssemblerService,
    BreederVerificationAdminCommandResultMapperService,
    BreederVerificationAdminListItemMapperService,
    BreederVerificationAdminPendingBreederItemMapperService,
    BreederVerificationAdminBreederItemMapperService,
    BreederVerificationAdminDetailMapperService,
    BreederVerificationAdminStatsResultMapperService,
];

const BREEDER_VERIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    BreederVerificationAdminRepository,
    BreederVerificationAdminMongooseRepositoryAdapter,
    BreederVerificationAdminNotifierAdapter,
    BreederVerificationAdminFileUrlAdapter,
];

const BREEDER_VERIFICATION_ADMIN_PORT_BINDINGS = [
    {
        provide: BREEDER_VERIFICATION_ADMIN_READER_PORT,
        useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
    },
    {
        provide: BREEDER_VERIFICATION_ADMIN_WRITER_PORT,
        useExisting: BreederVerificationAdminMongooseRepositoryAdapter,
    },
    {
        provide: BREEDER_VERIFICATION_ADMIN_NOTIFIER_PORT,
        useExisting: BreederVerificationAdminNotifierAdapter,
    },
    {
        provide: BREEDER_VERIFICATION_ADMIN_FILE_URL_PORT,
        useExisting: BreederVerificationAdminFileUrlAdapter,
    },
];

export const BREEDER_VERIFICATION_ADMIN_MODULE_PROVIDERS = [
    ...BREEDER_VERIFICATION_ADMIN_USE_CASE_PROVIDERS,
    ...BREEDER_VERIFICATION_ADMIN_DOMAIN_PROVIDERS,
    ...BREEDER_VERIFICATION_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...BREEDER_VERIFICATION_ADMIN_PORT_BINDINGS,
];
