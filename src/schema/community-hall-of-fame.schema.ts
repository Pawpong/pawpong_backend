import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityHallOfFameDocument = CommunityHallOfFame & Document;

/**
 * 명예의 전당 수상작 (회차 확정 시점의 스냅샷)
 *
 * 표시에 필요한 값을 복사해 둔다. 원본 게시글만 참조하면 글이 삭제되거나
 * 작성자가 탈퇴·복구를 오갈 때 지난 회차 기록이 깨지기 때문이다.
 * 사진과 프로필 이미지는 서명 URL 이 만료되므로 파일명으로 보관하고 조회 시 URL 로 변환한다.
 */
@Schema({ _id: false })
export class CommunityHallOfFameWinner {
    @Prop({ type: Number, required: true, min: 1, max: 3 })
    rank: number;

    @Prop({ type: Types.ObjectId, required: true })
    postId: Types.ObjectId;

    @Prop({ type: Number, required: true, min: 0 })
    likeCount: number;

    @Prop({ type: Number, required: true, min: 0 })
    commentCount: number;

    @Prop({ type: Number, required: true, min: 0 })
    saveCount: number;

    /** 대표 사진 파일명 (사진이 없으면 null) */
    @Prop({ type: String, default: null })
    photoFileName: string | null;

    @Prop({ type: String, default: '' })
    bodyExcerpt: string;

    @Prop({ type: Types.ObjectId, required: true })
    authorId: Types.ObjectId;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    authorModel: 'Adopter' | 'Breeder';

    @Prop({ type: String, required: true })
    authorNickname: string;

    @Prop({ type: String, default: null })
    authorProfileImageFileName: string | null;
}

export const CommunityHallOfFameWinnerSchema = SchemaFactory.createForClass(CommunityHallOfFameWinner);

/**
 * 커뮤니티 명예의 전당 회차
 *
 * 한 달을 3회차로 나눈다 (1~10일 / 11~20일 / 21~말일, KST 기준).
 * state 가 'open' 인 동안에는 매 시각 재집계하고, 회차가 지나면 'final' 로 확정한다.
 * 확정 이후에는 다시 집계하지 않는다 — 좋아요 취소가 하드 삭제라 재집계하면 과거 순위가 뒤집힌다.
 */
@Schema({ timestamps: true, collection: 'community_hall_of_fame' })
export class CommunityHallOfFame {
    /** 'YYYY-M-N' (N = 1|2|3) */
    @Prop({ type: String, required: true, unique: true, index: true })
    periodKey: string;

    /** 회차 시작 (KST 기준 첫날 00:00 의 UTC 시각) */
    @Prop({ type: Date, required: true })
    startDate: Date;

    /** 회차 종료 — 다음 회차 시작 시각. 비교는 배타적($lt)이다. */
    @Prop({ type: Date, required: true })
    endDate: Date;

    @Prop({ type: String, enum: ['open', 'final'], default: 'open', index: true })
    state: 'open' | 'final';

    /** 좋아요 상위 0~3건. 해당 회차에 글이 없으면 빈 배열. */
    @Prop({ type: [CommunityHallOfFameWinnerSchema], default: [] })
    winners: CommunityHallOfFameWinner[];

    @Prop({ type: Date, required: true })
    refreshedAt: Date;
}

export const CommunityHallOfFameSchema = SchemaFactory.createForClass(CommunityHallOfFame);

// 지난 회차 목록은 확정분만 최신순으로 조회한다.
CommunityHallOfFameSchema.index({ state: 1, endDate: -1 });
