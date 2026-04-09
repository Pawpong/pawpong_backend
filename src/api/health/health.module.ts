import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';
import { HealthResponseMessageService } from './domain/services/health-response-message.service';
import { SYSTEM_RUNTIME_READER } from './application/ports/system-runtime-reader.port';
import { SystemRuntimeAdapter } from './infrastructure/system-runtime.adapter';

@Module({
    controllers: [HealthController],
    providers: [
        GetHealthUseCase,
        HealthResponseMessageService,
        SystemRuntimeAdapter,
        {
            provide: SYSTEM_RUNTIME_READER,
            useExisting: SystemRuntimeAdapter,
        },
    ],
})
export class HealthModule {}
