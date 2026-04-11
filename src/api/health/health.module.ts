import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { SYSTEM_RUNTIME_READER_PORT } from './application/ports/system-runtime-reader.port';
import { SystemRuntimeAdapter } from './infrastructure/system-runtime.adapter';

@Module({
    controllers: [HealthController],
    providers: [
        GetHealthUseCase,
        SystemRuntimeAdapter,
        {
            provide: SYSTEM_RUNTIME_READER_PORT,
            useExisting: SystemRuntimeAdapter,
        },
    ],
})
export class HealthModule {}
