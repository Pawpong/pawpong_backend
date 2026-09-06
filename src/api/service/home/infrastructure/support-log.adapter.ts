import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SupportEvent, SupportLogPort } from '../application/ports/support-log.port';
import { SupportEventRepository } from '../repository/support-event.repository';

@Injectable()
export class SupportLogAdapter implements SupportLogPort {
    constructor(
        private readonly repository: SupportEventRepository,
        private readonly config: ConfigService,
    ) {}
    record(event: SupportEvent): Promise<void> {
        return this.repository.insert(
            event,
            this.config.get<string>('APP_ENV') || this.config.get<string>('NODE_ENV') || 'development',
        );
    }
}
