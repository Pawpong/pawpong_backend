import { DatabaseModule } from '../../../common/database/database.module';
import { DATABASE_READINESS_READER_PORT } from './application/ports/database-readiness-reader.port';
import { SYSTEM_RUNTIME_READER_PORT } from './application/ports/system-runtime-reader.port';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { GetReadinessUseCase } from './application/use-cases/get-readiness.use-case';
import { HealthController } from './controller/health.controller';
import { DatabaseReadinessMongooseAdapter } from './infrastructure/database-readiness-mongoose.adapter';
import { SystemRuntimeAdapter } from './infrastructure/system-runtime.adapter';

export const HEALTH_MODULE_IMPORTS = [DatabaseModule];

export const HEALTH_MODULE_CONTROLLERS = [HealthController];

const HEALTH_USE_CASE_PROVIDERS = [GetHealthUseCase, GetReadinessUseCase];

const HEALTH_INFRASTRUCTURE_PROVIDERS = [SystemRuntimeAdapter, DatabaseReadinessMongooseAdapter];

const HEALTH_PORT_BINDINGS = [
    {
        provide: SYSTEM_RUNTIME_READER_PORT,
        useExisting: SystemRuntimeAdapter,
    },
    {
        provide: DATABASE_READINESS_READER_PORT,
        useExisting: DatabaseReadinessMongooseAdapter,
    },
];

export const HEALTH_MODULE_PROVIDERS = [
    ...HEALTH_USE_CASE_PROVIDERS,
    ...HEALTH_INFRASTRUCTURE_PROVIDERS,
    ...HEALTH_PORT_BINDINGS,
];
