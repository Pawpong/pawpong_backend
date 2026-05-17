import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommunityBookmarkDocument = CommunityBookmark &
    Document & {
        _id: Types.ObjectId;
        createdAt: Date;
    };

/**
 * v2 커뮤니티 게시글 저장(북마크) — 저장 피드 탭 (Figma 711:59266).
 * 사용자 1명이 게시글 1개에 최대 1회 저장 가능 (복합 유니크 인덱스).
 * 저장/취소 시 community_posts.saveCount 를 원자적으로 갱신한다.
 */
@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'community_bookmarks' })
export class CommunityBookmark {
    @Prop({ type: Types.ObjectId, ref: 'CommunityPost', required: true, index: true })
    postId: Types.ObjectId;

    /** 사용자 ObjectId 문자열 (Adopter/Breeder 공용) */
    @Prop({ required: true, index: true })
    userId: string;

    @Prop({ type: String, enum: ['Adopter', 'Breeder'], required: true })
    userModel: 'Adopter' | 'Breeder';

    createdAt: Date;
}

export const CommunityBookmarkSchema = SchemaFactory.createForClass(CommunityBookmark);

CommunityBookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });
CommunityBookmarkSchema.index({ userId: 1, createdAt: -1 });
