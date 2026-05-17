import { Injectable } from '@nestjs/common';

import type { ContestDocument } from '../../../schema/contest.schema';
import type { ContestEntryDocument } from '../../../schema/contest-entry.schema';
import {
    type ContestEntrySnapshot,
    type ContestReaderPort,
    type ContestSnapshot,
} from '../application/ports/contest-reader.port';
import { ContestRepository } from '../repository/contest.repository';

@Injectable()
export class ContestReaderMongooseAdapter implements ContestReaderPort {
    constructor(private readonly repository: ContestRepository) {}

    async findActive(): Promise<ContestSnapshot | null> {
        const doc = await this.repository.findActiveContest();
        return doc ? this.toContestSnapshot(doc) : null;
    }

    async findLatestEnded(): Promise<ContestSnapshot | null> {
        const doc = await this.repository.findLatestEndedContest();
        return doc ? this.toContestSnapshot(doc) : null;
    }

    async findAllEnded(query: { page: number; limit: number }): Promise<ContestSnapshot[]> {
        const skip = (query.page - 1) * query.limit;
        const docs = await this.repository.findEndedContests(skip, query.limit);
        return docs.map((d) => this.toContestSnapshot(d));
    }

    countAllEnded(): Promise<number> {
        return this.repository.countEndedContests();
    }

    async findTopEntries(contestId: string, limit: number): Promise<ContestEntrySnapshot[]> {
        const docs = await this.repository.findTopEntries(contestId, limit);
        return docs.map((d) => this.toEntrySnapshot(d));
    }

    async findEntries(contestId: string, query: { page: number; limit: number }): Promise<ContestEntrySnapshot[]> {
        const skip = (query.page - 1) * query.limit;
        const docs = await this.repository.findEntries(contestId, skip, query.limit);
        return docs.map((d) => this.toEntrySnapshot(d));
    }

    countEntries(contestId: string): Promise<number> {
        return this.repository.countEntries(contestId);
    }

    async findEntryByUserId(contestId: string, userId: string): Promise<ContestEntrySnapshot | null> {
        const doc = await this.repository.findEntryByUserId(contestId, userId);
        return doc ? this.toEntrySnapshot(doc) : null;
    }

    async findEntryById(entryId: string): Promise<ContestEntrySnapshot | null> {
        const doc = await this.repository.findEntryById(entryId);
        return doc ? this.toEntrySnapshot(doc) : null;
    }

    async findVotedEntryId(contestId: string, voterId: string): Promise<string | null> {
        const vote = await this.repository.findVote(contestId, voterId);
        return vote ? vote.entryId.toString() : null;
    }

    private toContestSnapshot(doc: ContestDocument): ContestSnapshot {
        return {
            id: doc._id.toString(),
            title: doc.title,
            description: doc.description,
            benefitText: doc.benefitText ?? '',
            startDate: doc.startDate,
            endDate: doc.endDate,
            status: doc.status as 'active' | 'ended',
            participantCount: doc.participantCount ?? 0,
            createdAt: doc.createdAt,
        };
    }

    private toEntrySnapshot(doc: ContestEntryDocument): ContestEntrySnapshot {
        return {
            id: doc._id.toString(),
            contestId: doc.contestId.toString(),
            userId: doc.userId,
            userDisplayName: doc.userDisplayName,
            userProfileImageFileName: doc.userProfileImageFileName ?? null,
            photoFileName: doc.photoFileName,
            description: doc.description,
            voteCount: doc.voteCount ?? 0,
            rank: doc.rank ?? null,
            createdAt: doc.createdAt,
        };
    }
}
