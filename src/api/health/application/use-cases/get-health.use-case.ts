import { Inject, Injectable } from '@nestjs/common';

import {
    SYSTEM_RUNTIME_READER,
    type SystemRuntimeReaderPort,
} from '../ports/system-runtime-reader.port';
import { HealthStatus } from '../../domain/entities/health-status.entity';
import { HealthCheckResponseDto } from '../../dto/response/health-check-response.dto';

@Injectable()
export class GetHealthUseCase {
    constructor(
        @Inject(SYSTEM_RUNTIME_READER)
        private readonly systemRuntimeReader: SystemRuntimeReaderPort,
    ) {}

    execute(): HealthCheckResponseDto {
        const runtimeSnapshot = this.systemRuntimeReader.read();

        return HealthStatus.healthy(runtimeSnapshot).toResponse();
    }
}
