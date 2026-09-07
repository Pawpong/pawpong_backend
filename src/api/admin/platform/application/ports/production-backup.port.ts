export const PRODUCTION_BACKUP = Symbol('PRODUCTION_BACKUP');
export interface ProductionBackupPort {
    request(adminId: string): Promise<{ jobId: string }>;
    list(): Promise<{ enabled: boolean; jobs: unknown[] }>;
}
