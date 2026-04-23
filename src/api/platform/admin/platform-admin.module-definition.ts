import { MongooseModule } from '@nestjs/mongoose';

import { Adopter, AdopterSchema } from '../../../schema/adopter.schema';
import { AdoptionApplication, AdoptionApplicationSchema } from '../../../schema/adoption-application.schema';
import { Admin, AdminSchema } from '../../../schema/admin.schema';
import { Breeder, BreederSchema } from '../../../schema/breeder.schema';
import { SystemStats, SystemStatsSchema } from '../../../schema/system-stats.schema';

import { PLATFORM_ADMIN_READER_PORT } from './application/ports/platform-admin-reader.port';
import { GetPlatformMvpStatsUseCase } from './application/use-cases/get-platform-mvp-stats.use-case';
import { GetPlatformStatsUseCase } from './application/use-cases/get-platform-stats.use-case';
import { GetSystemHealthUseCase } from './application/use-cases/get-system-health.use-case';
import { LOKI_QUERY_PORT } from './application/ports/loki-query.port';
import { PlatformAdminMvpStatsController } from './platform-admin-mvp-stats.controller';
import { PlatformAdminStatsController } from './platform-admin-stats.controller';
import { PlatformAdminSystemHealthController } from './platform-admin-system-health.controller';
import { PlatformAdminQueryPolicyService } from './domain/services/platform-admin-query-policy.service';
import { PlatformAdminResultMapperService } from './domain/services/platform-admin-result-mapper.service';
import { LogCategorizerService } from './domain/services/log-categorizer.service';
import { PlatformAdminMongooseReaderAdapter } from './infrastructure/platform-admin-mongoose-reader.adapter';
import { LokiQueryAdapter } from './infrastructure/loki-query.adapter';
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
    PlatformAdminSystemHealthController,
];

const PLATFORM_ADMIN_USE_CASE_PROVIDERS = [GetPlatformStatsUseCase, GetPlatformMvpStatsUseCase, GetSystemHealthUseCase];

const PLATFORM_ADMIN_DOMAIN_PROVIDERS = [
    PlatformAdminResultMapperService,
    PlatformAdminQueryPolicyService,
    LogCategorizerService,
];

const PLATFORM_ADMIN_INFRASTRUCTURE_PROVIDERS = [
    PlatformAdminRepository,
    PlatformAdminMongooseReaderAdapter,
    LokiQueryAdapter,
];

const PLATFORM_ADMIN_PORT_BINDINGS = [
    {
        provide: PLATFORM_ADMIN_READER_PORT,
        useExisting: PlatformAdminMongooseReaderAdapter,
    },
    {
        provide: LOKI_QUERY_PORT,
        useExisting: LokiQueryAdapter,
    },
];

export const PLATFORM_ADMIN_MODULE_PROVIDERS = [
    ...PLATFORM_ADMIN_USE_CASE_PROVIDERS,
    ...PLATFORM_ADMIN_DOMAIN_PROVIDERS,
    ...PLATFORM_ADMIN_INFRASTRUCTURE_PROVIDERS,
    ...PLATFORM_ADMIN_PORT_BINDINGS,
];
