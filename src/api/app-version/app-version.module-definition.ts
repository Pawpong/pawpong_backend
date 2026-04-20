import { MongooseModule } from '@nestjs/mongoose';

import { AppVersion, AppVersionSchema } from '../../schema/app-version.schema';
import { CustomLoggerService } from '../../common/logger/custom-logger.service';

import { APP_VERSION_READER_PORT } from './application/ports/app-version-reader.port';
import { CheckAppVersionUseCase } from './application/use-cases/check-app-version.use-case';
import { AppVersionAdminCommandController } from './admin/app-version-admin-command.controller';
import { AppVersionAdminQueryController } from './admin/app-version-admin-query.controller';
import { APP_VERSION_ADMIN_READER_PORT } from './admin/application/ports/app-version-admin-reader.port';
import { APP_VERSION_WRITER_PORT } from './admin/application/ports/app-version-writer.port';
import { CreateAppVersionUseCase } from './admin/application/use-cases/create-app-version.use-case';
import { DeleteAppVersionUseCase } from './admin/application/use-cases/delete-app-version.use-case';
import { GetAppVersionListUseCase } from './admin/application/use-cases/get-app-version-list.use-case';
import { UpdateAppVersionUseCase } from './admin/application/use-cases/update-app-version.use-case';
import { AppVersionAdminCommandPolicyService } from './admin/domain/services/app-version-admin-command-policy.service';
import { AppVersionAdminItemMapperService } from './admin/domain/services/app-version-admin-item-mapper.service';
import { AppVersionAdminPageAssemblerService } from './admin/domain/services/app-version-admin-page-assembler.service';
import { AppVersionAdminPaginationAssemblerService } from './admin/domain/services/app-version-admin-pagination-assembler.service';
import { AppVersionMongooseAdminReaderAdapter } from './admin/infrastructure/app-version-mongoose-admin-reader.adapter';
import { AppVersionMongooseWriterAdapter } from './admin/infrastructure/app-version-mongoose-writer.adapter';
import { AppVersionController } from './app-version.controller';
import { AppVersionPolicyService } from './domain/services/app-version-policy.service';
import { AppVersionMongooseReaderAdapter } from './infrastructure/app-version-mongoose-reader.adapter';
import { AppVersionRepository } from './repository/app-version.repository';

const APP_VERSION_SCHEMA_IMPORTS = MongooseModule.forFeature([{ name: AppVersion.name, schema: AppVersionSchema }]);

export const APP_VERSION_MODULE_IMPORTS = [APP_VERSION_SCHEMA_IMPORTS];

export const APP_VERSION_MODULE_CONTROLLERS = [
    AppVersionController,
    AppVersionAdminQueryController,
    AppVersionAdminCommandController,
];

const APP_VERSION_USE_CASE_PROVIDERS = [
    CheckAppVersionUseCase,
    CreateAppVersionUseCase,
    GetAppVersionListUseCase,
    UpdateAppVersionUseCase,
    DeleteAppVersionUseCase,
];

const APP_VERSION_DOMAIN_PROVIDERS = [
    AppVersionPolicyService,
    AppVersionAdminCommandPolicyService,
    AppVersionAdminItemMapperService,
    AppVersionAdminPageAssemblerService,
    AppVersionAdminPaginationAssemblerService,
];

const APP_VERSION_INFRASTRUCTURE_PROVIDERS = [
    CustomLoggerService,
    AppVersionRepository,
    AppVersionMongooseReaderAdapter,
    AppVersionMongooseAdminReaderAdapter,
    AppVersionMongooseWriterAdapter,
];

const APP_VERSION_PORT_BINDINGS = [
    {
        provide: APP_VERSION_READER_PORT,
        useExisting: AppVersionMongooseReaderAdapter,
    },
    {
        provide: APP_VERSION_ADMIN_READER_PORT,
        useExisting: AppVersionMongooseAdminReaderAdapter,
    },
    {
        provide: APP_VERSION_WRITER_PORT,
        useExisting: AppVersionMongooseWriterAdapter,
    },
];

export const APP_VERSION_MODULE_PROVIDERS = [
    ...APP_VERSION_USE_CASE_PROVIDERS,
    ...APP_VERSION_DOMAIN_PROVIDERS,
    ...APP_VERSION_INFRASTRUCTURE_PROVIDERS,
    ...APP_VERSION_PORT_BINDINGS,
];
