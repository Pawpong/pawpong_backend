import { Injectable } from '@nestjs/common';

import { ContestRepository } from '../../repository/contest.repository';
import type { ContestAdminWriterPort } from '../application/ports/contest-admin-writer.port';

@Injectable()
export class ContestAdminWriterMongooseAdapter implements ContestAdminWriterPort {
    constructor(private readonly repository: ContestRepository) {}

    updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void> {
        return this.repository.updateEntryStatus(entryId, status);
    }
}
