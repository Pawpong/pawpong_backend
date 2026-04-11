import { Inject, Injectable } from '@nestjs/common';

import {
    SYSTEM_RUNTIME_READER_PORT,
    type SystemRuntimeReaderPort,
} from '../ports/system-runtime-reader.port';
import { HealthStatus } from '../../domain/entities/health-status.entity';
import type { HealthResult } from '../types/health-result.type';

@Injectable()
export class GetHealthUseCase {
    constructor(
        @Inject(SYSTEM_RUNTIME_READER_PORT)
        private readonly systemRuntimeReader: SystemRuntimeReaderPort,
    ) {}

    execute(): HealthResult {
        const runtimeSnapshot = this.systemRuntimeReader.read();

        return HealthStatus.healthy(runtimeSnapshot).toResult();
    }
}
