import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import {
    AdoptionApplication,
    AdoptionApplicationSchema,
} from '../../../schema/adoption-application.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { SystemStats, SystemStatsSchema } from '../../../schema/system-stats.schema';

import { PLATFORM_ADMIN_READER_PORT } from './application/ports/platform-admin-reader.port';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { PlatformAdminMvpStatsController } from './platform-admin-mvp-stats.controller';
import { PlatformAdminStatsController } from './platform-admin-stats.controller';
import { PlatformAdminQueryPolicyService } from './domain/services/platform-admin-query-policy.service';
import { PlatformAdminResultMapperService } from './domain/services/platform-admin-result-mapper.service';
import { PlatformAdminMongooseReaderAdapter } from './infrastructure/platform-admin-mongoose-reader.adapter';
import { PlatformAdminRepository } from './repository/platform-admin.repository';

const PLATFORM_ADMIN_SCHEMA_IMPORTS = MongooseModule.forFeature([
    { name: Admin.name, schema: AdminSchema },
    { name: Breeder.name, schema: BreederSchema },
    { name: Adopter.name, schema: AdopterSchema },
    { name: SystemStats.name, schema: SystemStatsSchema },
    { name: AdoptionApplication.name, schema: AdoptionApplicationSchema },
]);

export const PLATFORM_ADMIN_MODULE_IMPORTS = [PLATFORM_ADMIN_SCHEMA_IMPORTS];

export const PLATFORM_ADMIN_MODULE_CONTROLLERS = [
    PlatformAdminStatsController,
    PlatformAdminMvpStatsController,
];

const PLATFORM_ADMIN_USE_CASE_PROVIDERS = [GetPlatformStatsUseCase, GetPlatformMvpStatsUseCase];

const PLATFORM_ADMIN_DOMAIN_PROVIDERS = [
    PlatformAdminResultMapperService,
    PlatformAdminQueryPolicyService,
];

const PLATFORM_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    PlatformAdminRepository,
    PlatformAdminMongooseReaderAdapter,
];

const PLATFORM_ADMIN_PORT_BINDINGS = [
    {
        provide: PLATFORM_ADMIN_READER_PORT,
        useExisting: PlatformAdminMongooseReaderAdapter,
    },
];

export const PLATFORM_ADMIN_MODULE_PROVIDERS = [
    ...PLATFORM_ADMIN_USE_CASE_PROVIDERS,
    ...PLATFORM_ADMIN_DOMAIN_PROVIDERS,
    ...PLATFORM_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...PLATFORM_ADMIN_PORT_BINDINGS,
];
