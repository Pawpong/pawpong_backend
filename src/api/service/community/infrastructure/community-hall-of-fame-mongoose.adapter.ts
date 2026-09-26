import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
    CommunityHallOfFame,
    CommunityHallOfFameDocument,
    CommunityHallOfFameWinner,
} from '../../../../schema/community-hall-of-fame.schema';
import type {
    CommunityHallOfFamePort,
    CommunityHallOfFameSnapshot,
    CommunityHallOfFameUpsertCommand,
    CommunityHallOfFameWinnerSnapshot,
} from '../application/ports/community-hall-of-fame.port';

@Injectable()
export class CommunityHallOfFameMongooseAdapter implements CommunityHallOfFamePort {
    constructor(
        @InjectModel(CommunityHallOfFame.name)
        private readonly hallOfFameModel: Model<CommunityHallOfFameDocument>,
    ) {}

    /**
     * open 상태에서만 갱신한다.
     *
     * upsert 라 인스턴스가 여럿이어도 락 없이 안전하다.
     * state 조건을 필터에 두어, 확정된 회차가 재집계로 덮이는 일을 막는다
     * (좋아요 취소가 하드 삭제라 재집계하면 과거 순위가 뒤집힌다).
     */
    async upsertOpen(command: CommunityHallOfFameUpsertCommand): Promise<void> {
        await this.hallOfFameModel
            .updateOne(
                { periodKey: command.periodKey, state: { $ne: 'final' } },
                {
                    $set: {
                        startDate: command.startDate,
                        endDate: command.endDate,
                        refreshedAt: command.refreshedAt,
                        winners: command.winners.map((winner) => this.toDocumentWinner(winner)),
                    },
                    $setOnInsert: { periodKey: command.periodKey, state: 'open' },
                },
                { upsert: true },
            )
            .exec();
    }

    async finalize(periodKey: string): Promise<boolean> {
        const result = await this.hallOfFameModel
            .updateOne({ periodKey, state: 'open' }, { $set: { state: 'final' } })
            .exec();

        return result.modifiedCount > 0;
    }

    async findByPeriodKey(periodKey: string): Promise<CommunityHallOfFameSnapshot | null> {
        const doc = await this.hallOfFameModel.findOne({ periodKey }).lean<CommunityHallOfFameDocument>().exec();
        return doc ? this.toSnapshot(doc) : null;
    }

    async findFinalized(
        skip: number,
        limit: number,
    ): Promise<{ items: CommunityHallOfFameSnapshot[]; totalItems: number }> {
        const filter = { state: 'final' as const };

        const [docs, totalItems] = await Promise.all([
            this.hallOfFameModel
                .find(filter)
                .sort({ endDate: -1 })
                .skip(skip)
                .limit(limit)
                .lean<CommunityHallOfFameDocument[]>()
                .exec(),
            this.hallOfFameModel.countDocuments(filter).exec(),
        ]);

        return { items: docs.map((doc) => this.toSnapshot(doc)), totalItems };
    }

    private toDocumentWinner(winner: CommunityHallOfFameWinnerSnapshot): CommunityHallOfFameWinner {
        return {
            rank: winner.rank,
            postId: new Types.ObjectId(winner.postId),
            likeCount: winner.likeCount,
            commentCount: winner.commentCount,
            saveCount: winner.saveCount,
            photoFileName: winner.photoFileName,
            bodyExcerpt: winner.bodyExcerpt,
            authorId: new Types.ObjectId(winner.authorId),
            authorModel: winner.authorModel,
            authorNickname: winner.authorNickname,
            authorProfileImageFileName: winner.authorProfileImageFileName,
        };
    }

    private toSnapshot(doc: CommunityHallOfFameDocument): CommunityHallOfFameSnapshot {
        return {
            periodKey: doc.periodKey,
            startDate: doc.startDate,
            endDate: doc.endDate,
            state: doc.state,
            refreshedAt: doc.refreshedAt,
            winners: (doc.winners ?? []).map((winner) => ({
                rank: winner.rank,
                postId: winner.postId.toString(),
                likeCount: winner.likeCount,
                commentCount: winner.commentCount,
                saveCount: winner.saveCount,
                photoFileName: winner.photoFileName ?? null,
                bodyExcerpt: winner.bodyExcerpt ?? '',
                authorId: winner.authorId.toString(),
                authorModel: winner.authorModel,
                authorNickname: winner.authorNickname,
                authorProfileImageFileName: winner.authorProfileImageFileName ?? null,
            })),
        };
    }
}
