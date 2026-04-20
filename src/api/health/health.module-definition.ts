import { SYSTEM_RUNTIME_READER_PORT } from './application/ports/system-runtime-reader.port';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { HealthController } from './health.controller';
import { SystemRuntimeAdapter } from './infrastructure/system-runtime.adapter';

export const HEALTH_MODULE_CONTROLLERS = [HealthController];

const HEALTH_USE_CASE_PROVIDERS = [GetHealthUseCase];

const HEALTH_INFRASTRUCTURE_PROVIDERS = [SystemRuntimeAdapter];

const HEALTH_PORT_BINDINGS = [
    {
        provide: SYSTEM_RUNTIME_READER_PORT,
        useExisting: SystemRuntimeAdapter,
    },
];

export const HEALTH_MODULE_PROVIDERS = [
    ...HEALTH_USE_CASE_PROVIDERS,
    ...HEALTH_INFRASTRUCTURE_PROVIDERS,
    ...HEALTH_PORT_BINDINGS,
];
