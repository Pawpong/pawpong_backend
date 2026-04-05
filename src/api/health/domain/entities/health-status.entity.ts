import { HealthCheckResponseDto } from '../../dto/response/health-check-response.dto';
import { type SystemRuntimeSnapshot } from '../../application/ports/system-runtime-reader.port';

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

    toResponse(): HealthCheckResponseDto {
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
