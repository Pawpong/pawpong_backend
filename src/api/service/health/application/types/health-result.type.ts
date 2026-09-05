export interface HealthResult {
    status: 'healthy';
    timestamp: string;
    service: string;
    version: string;
    environment: string;
    uptime: number;
}
