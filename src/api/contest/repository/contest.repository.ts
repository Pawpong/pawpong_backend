import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Contest, ContestDocument } from '../../../schema/contest.schema';
import { ContestEntry, ContestEntryDocument } from '../../../schema/contest-entry.schema';
import { ContestVote, ContestVoteDocument } from '../../../schema/contest-vote.schema';

@Injectable()
export class ContestRepository {
    constructor(
        @InjectModel(Contest.name) private readonly contestModel: Model<ContestDocument>,
        @InjectModel(ContestEntry.name) private readonly entryModel: Model<ContestEntryDocument>,
        @InjectModel(ContestVote.name) private readonly voteModel: Model<ContestVoteDocument>,
    ) {}

    findActiveContest(): Promise<ContestDocument | null> {
        return this.contestModel.findOne({ status: 'active' }).sort({ startDate: -1 }).lean<ContestDocument>().exec();
    }

    findLatestEndedContest(): Promise<ContestDocument | null> {
        return this.contestModel.findOne({ status: 'ended' }).sort({ endDate: -1 }).lean<ContestDocument>().exec();
    }

    findEndedContests(skip: number, limit: number): Promise<ContestDocument[]> {
        return this.contestModel
            .find({ status: 'ended' })
            .sort({ endDate: -1 })
            .skip(skip)
            .limit(limit)
            .lean<ContestDocument[]>()
            .exec();
    }

    countEndedContests(): Promise<number> {
        return this.contestModel.countDocuments({ status: 'ended' }).exec();
    }

    incrementParticipantCount(contestId: string): Promise<void> {
        return this.contestModel
            .updateOne({ _id: new Types.ObjectId(contestId) }, { $inc: { participantCount: 1 } })
            .exec()
            .then(() => undefined);
    }

    findTopEntries(contestId: string, limit: number): Promise<ContestEntryDocument[]> {
        return this.entryModel
            .find({ contestId: new Types.ObjectId(contestId) })
            .sort({ voteCount: -1, createdAt: 1 })
            .limit(limit)
            .lean<ContestEntryDocument[]>()
            .exec();
    }

    findEntries(contestId: string, skip: number, limit: number): Promise<ContestEntryDocument[]> {
        return this.entryModel
            .find({ contestId: new Types.ObjectId(contestId) })
            .sort({ voteCount: -1, createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean<ContestEntryDocument[]>()
            .exec();
    }

    countEntries(contestId: string): Promise<number> {
        return this.entryModel.countDocuments({ contestId: new Types.ObjectId(contestId) }).exec();
    }

    findEntryByUserId(contestId: string, userId: string): Promise<ContestEntryDocument | null> {
        return this.entryModel
            .findOne({ contestId: new Types.ObjectId(contestId), userId })
            .lean<ContestEntryDocument>()
            .exec();
    }

    findEntryById(entryId: string): Promise<ContestEntryDocument | null> {
        if (!Types.ObjectId.isValid(entryId)) return Promise.resolve(null);
        return this.entryModel.findById(entryId).lean<ContestEntryDocument>().exec();
    }

    async createEntry(data: {
        contestId: string;
        userId: string;
        userDisplayName: string;
        userProfileImageFileName: string | null;
        photoFileName: string;
        description: string;
    }): Promise<string> {
        const doc = await this.entryModel.create({
            contestId: new Types.ObjectId(data.contestId),
            userId: data.userId,
            userDisplayName: data.userDisplayName,
            userProfileImageFileName: data.userProfileImageFileName,
            photoFileName: data.photoFileName,
            description: data.description,
        });
        return doc._id.toString();
    }

    findVote(contestId: string, voterId: string): Promise<ContestVoteDocument | null> {
        return this.voteModel
            .findOne({ contestId: new Types.ObjectId(contestId), voterId })
            .lean<ContestVoteDocument>()
            .exec();
    }

    async vote(data: { contestId: string; entryId: string; voterId: string }): Promise<number> {
        await this.voteModel.create({
            contestId: new Types.ObjectId(data.contestId),
            entryId: new Types.ObjectId(data.entryId),
            voterId: data.voterId,
        });

        const updated = await this.entryModel
            .findByIdAndUpdate(new Types.ObjectId(data.entryId), { $inc: { voteCount: 1 } }, { new: true })
            .lean<ContestEntryDocument>()
            .exec();

        return updated?.voteCount ?? 0;
    }
}
