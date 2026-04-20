export const SYSTEM_RUNTIME_READER_PORT = Symbol('SYSTEM_RUNTIME_READER_PORT');

export interface SystemRuntimeSnapshot {
    readonly timestamp: string;
    readonly environment: string;
    readonly uptime: number;
}

export interface SystemRuntimeReaderPort {
    read(): SystemRuntimeSnapshot;
}
