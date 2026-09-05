import { Inject, Injectable } from '@nestjs/common';

import { HealthStatus } from '../../domain/entities/health-status.entity';
import {
    DATABASE_READINESS_READER_PORT,
    type DatabaseReadinessReaderPort,
} from '../ports/database-readiness-reader.port';
import { SYSTEM_RUNTIME_READER_PORT, type SystemRuntimeReaderPort } from '../ports/system-runtime-reader.port';
import type { ReadinessResult } from '../types/readiness-result.type';

@Injectable()
export class GetReadinessUseCase {
    constructor(
        @Inject(SYSTEM_RUNTIME_READER_PORT)
        private readonly systemRuntimeReader: SystemRuntimeReaderPort,
        @Inject(DATABASE_READINESS_READER_PORT)
        private readonly databaseReadinessReader: DatabaseReadinessReaderPort,
    ) {}

    async execute(): Promise<ReadinessResult> {
        const runtimeStatus = HealthStatus.healthy(this.systemRuntimeReader.read()).toResult();
        const database = await this.databaseReadinessReader.read();

        return {
            ...runtimeStatus,
            status: database.status,
            dependencies: { database },
        };
    }
}
