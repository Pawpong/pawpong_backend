import { Injectable } from '@nestjs/common';

import { type CreateContestEntryData, type ContestWriterPort } from '../application/ports/contest-writer.port';
import { ContestRepository } from '../repository/contest.repository';

@Injectable()
export class ContestWriterMongooseAdapter implements ContestWriterPort {
    constructor(private readonly repository: ContestRepository) {}

    createEntry(data: CreateContestEntryData): Promise<string> {
        return this.repository.createEntry(data);
    }

    incrementParticipantCount(contestId: string): Promise<void> {
        return this.repository.incrementParticipantCount(contestId);
    }

    vote(data: { contestId: string; entryId: string; voterId: string }): Promise<number> {
        return this.repository.vote(data);
    }
}
