import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContestEntryDocument = ContestEntry &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
        updatedAt: Date;
    };

/**
 * 콘테스트 참여 항목.
 * 유저가 사진+설명으로 콘테스트에 제출하며, 다른 유저가 투표할 수 있다.
 * 유저당 콘테스트당 1회 제출 제한 (unique index).
 */
@Schema({ timestamps: true, collection: 'contest_entries' })
export class ContestEntry {
    @Prop({ type: Types.ObjectId, ref: 'Contest', required: true, index: true })
    contestId: Types.ObjectId;

    /** 제출한 유저 ID (문자열) */
    @Prop({ required: true, index: true })
    userId: string;

    /** 표시용 닉네임 (제출 시 스냅샷) */
    @Prop({ required: true })
    userDisplayName: string;

    /** 프로필 이미지 파일명 (스냅샷, signed URL 변환은 use-case 에서 수행) */
    @Prop({ type: String, default: null })
    userProfileImageFileName: string | null;

    /** S3 파일명 (signed URL 로 변환해서 응답) */
    @Prop({ required: true })
    photoFileName: string;

    @Prop({ required: true })
    description: string;

    /** 받은 투표 수 (투표 시 원자적 +1) */
    @Prop({ default: 0, index: true })
    voteCount: number;

    /** 콘테스트 종료 후 순위 (1~3 = 명예의 전당). null = 미집계 또는 3위 밖 */
    @Prop({ type: Number, default: null })
    rank: number | null;
}

export const ContestEntrySchema = SchemaFactory.createForClass(ContestEntry);

/** 유저당 콘테스트당 1회 제출 제한 */
ContestEntrySchema.index({ contestId: 1, userId: 1 }, { unique: true });
