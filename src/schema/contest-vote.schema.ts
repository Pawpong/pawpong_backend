import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContestVoteDocument = ContestVote &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
    };

/**
 * 콘테스트 투표 기록.
 * 유저는 콘테스트당 1회 투표 가능 (unique index on contestId + voterId).
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'contest_votes' })
export class ContestVote {
    @Prop({ type: Types.ObjectId, ref: 'Contest', required: true, index: true })
    contestId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ContestEntry', required: true, index: true })
    entryId: Types.ObjectId;

    /** 투표한 유저 ID */
    @Prop({ required: true, index: true })
    voterId: string;
}

export const ContestVoteSchema = SchemaFactory.createForClass(ContestVote);

/** 유저당 콘테스트당 1회 투표 제한 */
ContestVoteSchema.index({ contestId: 1, voterId: 1 }, { unique: true });
