import { type SystemRuntimeSnapshot } from '../../application/ports/system-runtime-reader.port';
import type { HealthResult } from '../../application/types/health-result.type';

const SERVICE_NAME = 'Pawpong Backend';
const SERVICE_VERSION = '1.0.0-MVP';

export class HealthStatus {
    private constructor(
        private readonly status: 'healthy',
        private readonly timestamp: string,
        private readonly environment: string,
        private readonly uptime: number,
    ) {}

    static healthy(runtimeSnapshot: SystemRuntimeSnapshot): HealthStatus {
        return new HealthStatus(
            'healthy',
            runtimeSnapshot.timestamp,
            runtimeSnapshot.environment,
            runtimeSnapshot.uptime,
        );
    }

    toResult(): HealthResult {
        return {
            status: this.status,
            timestamp: this.timestamp,
            service: SERVICE_NAME,
            version: SERVICE_VERSION,
            environment: this.environment,
            uptime: this.uptime,
        };
    }
}
