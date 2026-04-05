import { Injectable } from '@nestjs/common';

import {
    type SystemRuntimeReaderPort,
    type SystemRuntimeSnapshot,
} from '../application/ports/system-runtime-reader.port';

@Injectable()
export class SystemRuntimeAdapter implements SystemRuntimeReaderPort {
    read(): SystemRuntimeSnapshot {
        return {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: Math.floor(process.uptime()),
        };
    }
}
