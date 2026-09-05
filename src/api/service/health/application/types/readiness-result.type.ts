import type { DatabaseReadinessSnapshot } from '../ports/database-readiness-reader.port';

export interface ReadinessResult {
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    service: string;
    version: string;
    environment: string;
    uptime: number;
    dependencies: {
        database: DatabaseReadinessSnapshot;
    };
}
