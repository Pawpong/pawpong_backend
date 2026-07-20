import { Inject, Injectable } from '@nestjs/common';

import { CONTEST_WRITER_PORT, type ContestWriterPort } from '../../application/ports/contest-writer.port';
import type { ContestAdminWriterPort } from '../application/ports/contest-admin-writer.port';

@Injectable()
export class ContestAdminWriterMongooseAdapter implements ContestAdminWriterPort {
    constructor(@Inject(CONTEST_WRITER_PORT) private readonly contestWriter: ContestWriterPort) {}

    updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void> {
        return this.contestWriter.updateEntryStatus(entryId, status);
    }
}
