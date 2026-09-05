import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

const DATABASE_PING_MAX_TIME_MS = 2000;

export type DatabaseConnectionState =
    | 'disconnected'
    | 'connected'
    | 'connecting'
    | 'disconnecting'
    | 'uninitialized'
    | 'unknown';

export interface DatabaseReadinessSnapshot {
    status: 'healthy' | 'unhealthy';
    connectionState: DatabaseConnectionState;
    latencyMs: number;
}

@Injectable()
export class DatabaseReadinessService {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    async check(): Promise<DatabaseReadinessSnapshot> {
        const startedAt = Date.now();
        const connectionState = this.resolveConnectionState(this.connection.readyState);

        if (this.connection.readyState !== ConnectionStates.connected || !this.connection.db) {
            return {
                status: 'unhealthy',
                connectionState,
                latencyMs: Date.now() - startedAt,
            };
        }

        try {
            await this.connection.db.admin().ping({ maxTimeMS: DATABASE_PING_MAX_TIME_MS });
            return {
                status: 'healthy',
                connectionState,
                latencyMs: Date.now() - startedAt,
            };
        } catch {
            return {
                status: 'unhealthy',
                connectionState,
                latencyMs: Date.now() - startedAt,
            };
        }
    }

    private resolveConnectionState(state: ConnectionStates): DatabaseConnectionState {
        switch (state) {
            case ConnectionStates.disconnected:
                return 'disconnected';
            case ConnectionStates.connected:
                return 'connected';
            case ConnectionStates.connecting:
                return 'connecting';
            case ConnectionStates.disconnecting:
                return 'disconnecting';
            case ConnectionStates.uninitialized:
                return 'uninitialized';
            default:
                return 'unknown';
        }
    }
}
