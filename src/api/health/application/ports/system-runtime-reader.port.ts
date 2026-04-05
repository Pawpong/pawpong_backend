export const SYSTEM_RUNTIME_READER = Symbol('SYSTEM_RUNTIME_READER');

export interface SystemRuntimeSnapshot {
    readonly timestamp: string;
    readonly environment: string;
    readonly uptime: number;
}

export interface SystemRuntimeReaderPort {
    read(): SystemRuntimeSnapshot;
}
