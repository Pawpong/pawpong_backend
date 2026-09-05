export const DATABASE_READINESS_READER_PORT = Symbol('DATABASE_READINESS_READER_PORT');

export interface DatabaseReadinessSnapshot {
    readonly status: 'healthy' | 'unhealthy';
    readonly connectionState:
        | 'disconnected'
        | 'connected'
        | 'connecting'
        | 'disconnecting'
        | 'uninitialized'
        | 'unknown';
    readonly latencyMs: number;
}

export interface DatabaseReadinessReaderPort {
    read(): Promise<DatabaseReadinessSnapshot>;
}
