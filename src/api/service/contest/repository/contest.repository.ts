import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';

import { Contest, ContestDocument } from '../../../../schema/contest.schema';
import { ContestEntry, ContestEntryDocument } from '../../../../schema/contest-entry.schema';
import { ContestVote, ContestVoteDocument } from '../../../../schema/contest-vote.schema';
import type { ContestVoteCancelWriteResult, ContestVoteWriteResult } from '../application/ports/contest-writer.port';

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

    findContestById(contestId: string): Promise<ContestDocument | null> {
        if (!Types.ObjectId.isValid(contestId)) return Promise.resolve(null);
        return this.contestModel.findById(contestId).lean<ContestDocument>().exec();
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
            .find({ contestId: new Types.ObjectId(contestId), status: 'active' })
            .sort({ voteCount: -1, createdAt: 1 })
            .limit(limit)
            .lean<ContestEntryDocument[]>()
            .exec();
    }

    findEntries(contestId: string, skip: number, limit: number): Promise<ContestEntryDocument[]> {
        return this.entryModel
            .find({ contestId: new Types.ObjectId(contestId), status: 'active' })
            .sort({ voteCount: -1, createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean<ContestEntryDocument[]>()
            .exec();
    }

    countEntries(contestId: string): Promise<number> {
        return this.entryModel.countDocuments({ contestId: new Types.ObjectId(contestId), status: 'active' }).exec();
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

    async findRandomEntry(contestId: string, excludeUserId: string): Promise<ContestEntryDocument | null> {
        const results = await this.entryModel
            .aggregate<ContestEntryDocument>([
                {
                    $match: {
                        contestId: new Types.ObjectId(contestId),
                        userId: { $ne: excludeUserId },
                        status: 'active',
                    },
                },
                { $sample: { size: 1 } },
            ])
            .exec();
        return results[0] ?? null;
    }

    findVote(contestId: string, voterId: string): Promise<ContestVoteDocument | null> {
        return this.voteModel
            .findOne({ contestId: new Types.ObjectId(contestId), voterId })
            .lean<ContestVoteDocument>()
            .exec();
    }

    async updateEntryStatus(entryId: string, status: 'hidden' | 'deleted'): Promise<void> {
        await this.entryModel.updateOne({ _id: new Types.ObjectId(entryId) }, { $set: { status } }).exec();
    }

    /**
     * 투표. 멀티 도큐먼트 트랜잭션으로 게이트-기록-집계를 원자화한다.
     *
     * 게이트: 콘테스트 문서를 열림 조건(status=active, endDate 미경과)으로 조건부 갱신한다.
     * 조건 불충족이면 아무것도 쓰지 않고 'closed' 를 반환하고, 조건을 충족해 쓰기가 진행되는 중에
     * 종료 flip 이 끼어들면 같은 문서에 대한 쓰기 충돌로 트랜잭션이 재시도되어 'closed' 로 수렴한다.
     * 부분 반영(기록만 남고 집계 누락 등)은 트랜잭션 특성상 발생하지 않는다.
     */
    async vote(data: { contestId: string; entryId: string; voterId: string }): Promise<ContestVoteWriteResult> {
        const session = await this.contestModel.db.startSession();
        let result: ContestVoteWriteResult = { status: 'closed' };

        try {
            await session.withTransaction(async () => {
                const gate = await this.acquireOpenContestGate(data.contestId, session);
                if (!gate) {
                    result = { status: 'closed' };
                    throw new ContestWriteAbortSignal();
                }

                await this.voteModel.create(
                    [
                        {
                            contestId: new Types.ObjectId(data.contestId),
                            entryId: new Types.ObjectId(data.entryId),
                            voterId: data.voterId,
                        },
                    ],
                    { session },
                );

                const updated = await this.entryModel
                    .findByIdAndUpdate(
                        new Types.ObjectId(data.entryId),
                        { $inc: { voteCount: 1 } },
                        { new: true, session },
                    )
                    .lean<ContestEntryDocument>()
                    .exec();

                result = { status: 'ok', newVoteCount: updated?.voteCount ?? 0 };
            });
        } catch (error) {
            if (error instanceof ContestWriteAbortSignal) {
                // 게이트 미스가 만료된 active 콘테스트 때문이라면 이 자리에서 종료를 확정한다
                if (result.status === 'closed') {
                    await this.finalizeExpiredContest(data.contestId).catch(() => undefined);
                }
                return result;
            }
            // unique index(contestId+voterId) 충돌 — 동시 중복 투표 경합
            if (this.isDuplicateKeyError(error)) return { status: 'duplicate' };
            throw error;
        } finally {
            await session.endSession();
        }

        return result;
    }

    /**
     * 투표 취소. 투표와 동일한 트랜잭션 게이트를 사용해
     * 종료된(또는 종료 중인) 콘테스트의 확정 집계가 취소로 변조되지 않게 한다.
     */
    async cancelVote(data: {
        contestId: string;
        entryId: string;
        voterId: string;
    }): Promise<ContestVoteCancelWriteResult> {
        const session = await this.contestModel.db.startSession();
        let result: ContestVoteCancelWriteResult = { status: 'closed' };

        try {
            await session.withTransaction(async () => {
                const gate = await this.acquireOpenContestGate(data.contestId, session);
                if (!gate) {
                    result = { status: 'closed' };
                    throw new ContestWriteAbortSignal();
                }

                const deleted = await this.voteModel
                    .findOneAndDelete(
                        {
                            contestId: new Types.ObjectId(data.contestId),
                            entryId: new Types.ObjectId(data.entryId),
                            voterId: data.voterId,
                        },
                        { session },
                    )
                    .lean<ContestVoteDocument>()
                    .exec();

                if (!deleted) {
                    result = { status: 'not_voted' };
                    throw new ContestWriteAbortSignal();
                }

                // voteCount 가 이미 0 이면 감소를 건너뛰어 음수 노출을 막는다
                const updated = await this.entryModel
                    .findOneAndUpdate(
                        { _id: new Types.ObjectId(data.entryId), voteCount: { $gt: 0 } },
                        { $inc: { voteCount: -1 } },
                        { new: true, session },
                    )
                    .lean<ContestEntryDocument>()
                    .exec();

                result = { status: 'ok', newVoteCount: updated?.voteCount ?? 0 };
            });
        } catch (error) {
            if (error instanceof ContestWriteAbortSignal) {
                // 게이트 미스가 만료된 active 콘테스트 때문이라면 이 자리에서 종료를 확정한다
                if (result.status === 'closed') {
                    await this.finalizeExpiredContest(data.contestId).catch(() => undefined);
                }
                return result;
            }
            throw error;
        } finally {
            await session.endSession();
        }

        return result;
    }

    /**
     * 열린 콘테스트 게이트. 열림 조건을 만족할 때만 콘테스트 문서를 갱신(터치)한다.
     * 단순 read 가 아닌 write 인 이유: 트랜잭션 안에서 같은 문서를 쓰면
     * 동시 종료 flip 과 문서 단위 쓰기 충돌이 발생해 두 작업이 직렬화되기 때문이다.
     */
    private acquireOpenContestGate(contestId: string, session: ClientSession): Promise<ContestDocument | null> {
        return this.contestModel
            .findOneAndUpdate(
                { _id: new Types.ObjectId(contestId), status: 'active', endDate: { $gt: new Date() } },
                { $currentDate: { updatedAt: true } },
                { new: true, session },
            )
            .lean<ContestDocument>()
            .exec();
    }

    /**
     * 지연 종료 자기 치유. endDate 가 지났는데 아직 active 인 콘테스트를 ended 로 확정한다.
     * 결과 확정은 이 "쓰기"로만 진입하며, 이후의 투표/취소 트랜잭션은 게이트에서
     * 이 문서 상태와 직렬화되어 확정 결과를 건드릴 수 없다.
     */
    async finalizeExpiredContest(contestId: string): Promise<void> {
        if (!Types.ObjectId.isValid(contestId)) return;
        await this.contestModel
            .updateOne(
                { _id: new Types.ObjectId(contestId), status: 'active', endDate: { $lte: new Date() } },
                { $set: { status: 'ended' } },
            )
            .exec();
    }

    /**
     * 만료된 모든 active 콘테스트를 일괄 확정한다 (주기 스케줄러용).
     * 요청 유무와 무관하게 endDate 경과 후 확정이 보장되도록 하는 안전망이며,
     * 조건부 updateMany 라 여러 인스턴스가 동시에 실행해도 안전(멱등)하다.
     */
    async finalizeAllExpiredContests(): Promise<number> {
        const result = await this.contestModel
            .updateMany({ status: 'active', endDate: { $lte: new Date() } }, { $set: { status: 'ended' } })
            .exec();
        return result.modifiedCount ?? 0;
    }

    private isDuplicateKeyError(error: unknown): boolean {
        return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
    }
}

/** 트랜잭션을 결과 확정 후 중단시키기 위한 내부 신호 (실제 오류 아님) */
class ContestWriteAbortSignal extends Error {
    constructor() {
        super('contest write aborted');
    }
}
